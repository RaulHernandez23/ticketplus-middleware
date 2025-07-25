const User = require("../models/Usuario");
const RecuperacionContrasena = require("../models/RecuperacionContrasena");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../middlewares/config");
const { invalidTokens } = require("../middlewares/deleteToken");
const { generarJWT } = require("../middlewares/generateToken");
const { invalidarJWT } = require("../middlewares/deleteToken");
const enviarCorreoRecuperacion =
	require("../utils/enviarCorreo").enviarCorreoRecuperacion;

const login = async (req, res) => {
	const { correo, contraseña } = req.body;

	try {
		const usuario = await User.findOne({ where: { correo } });

		if (!usuario)
			return res
				.status(401)
				.json({ mensaje: "Correo o contraseña incorrectos" });

		const esValida = await bcrypt.compare(contraseña, usuario.contrasena);

		if (!esValida)
			return res
				.status(401)
				.json({ mensaje: "Correo o contraseña incorrectos" });

		const token = await generarJWT(usuario.id_usuario);

		res.json({
			mensaje: "Inicio de sesión exitoso",
			token,
			usuario: {
				id_usuario: usuario.id_usuario,
				nombre: usuario.nombre,
				apellido_paterno: usuario.apellido_paterno,
				apellido_materno: usuario.apellido_materno,
				correo: usuario.correo,
				fecha_registro: usuario.fecha_registro,
				estado: usuario.estado,
				codigo_postal: usuario.codigo_postal,
				id_pais: usuario.id_pais,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ mensaje: "Error interno del servidor" });
	}
};

const logout = async (req, res) => {
	try {
		const token = req.header("x-token");

		if (!token) {
			return res.status(401).json({ mensaje: "Token no proporcionado" });
		}

		invalidarJWT(token);

		res.json({ mensaje: "Sesión cerrada exitosamente" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ mensaje: "Error interno del servidor" });
	}
};

function generarCodigoRecuperacion() {
	const longitud = 6;
	const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let codigo = "";

	for (let i = 0; i < longitud; i++) {
		const indice = Math.floor(Math.random() * caracteres.length);
		codigo += caracteres.charAt(indice);
	}

	const expiracion = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
	return { codigo, expiracion };
}

const recuperarContraseña = async (req, res) => {
	const { correo } = req.body;

	if (!correo) {
		return res.status(400).json({ mensaje: "El correo es obligatorio." });
	}

	try {
		const usuario = await User.findOne({ where: { correo } });

		if (!usuario) {
			return res.status(404).json({ mensaje: "Correo no registrado." });
		}

		const { codigo, expiracion } = generarCodigoRecuperacion();

		// Guardar el código en la tabla recuperacion_contrasena
		await RecuperacionContrasena.create({
			id_usuario: usuario.id_usuario,
			token: codigo,
			fecha_expiracion: expiracion,
		});

		// Enviar correo
		const asunto = "Recuperación de contraseña - TicketPlus";
		const texto = `Hola ${usuario.nombre},\n\nTu código de recuperación es: ${codigo}.\nEste código es válido por 10 minutos.\n\nSi no solicitaste esto, puedes ignorar este mensaje.`;

		await enviarCorreoRecuperacion(usuario.correo, asunto, texto);

		return res.status(200).json({
			mensaje: "Código de recuperación enviado correctamente.",
		});
	} catch (error) {
		console.error("Error al iniciar recuperación de contraseña:", error);
		return res.status(500).json({
			mensaje: "Error interno del servidor. Intenta más tarde.",
		});
	}
};

const verificarCodigoRecuperacion = async (req, res) => {
	const { correo, codigo } = req.body;

	if (!correo || !codigo) {
		return res
			.status(400)
			.json({ mensaje: "Correo y código son obligatorios." });
	}

	try {
		const usuario = await User.findOne({ where: { correo } });

		if (!usuario) {
			return res.status(404).json({ mensaje: "Usuario no encontrado." });
		}

		const registro = await RecuperacionContrasena.findOne({
			where: {
				id_usuario: usuario.id_usuario,
				token: codigo,
				estado: "activo",
			},
			order: [["fecha_expiracion", "DESC"]],
		});

		if (!registro) {
			return res.status(404).json({ mensaje: "Código inválido." });
		}

		if (new Date() > new Date(registro.fecha_expiracion)) {
			await registro.update({ estado: "inactivo" });
			return res.status(400).json({ mensaje: "El código ha expirado." });
		}

		return res
			.status(200)
			.json({
				mensaje: "Código válido.",
				id_usuario: usuario.id_usuario,
			});
	} catch (error) {
		console.error("Error al validar código:", error);
		return res.status(500).json({ mensaje: "Error interno del servidor." });
	}
};

const cambiarContrasenaConCodigo = async (req, res) => {
	const { id_usuario, codigo, nueva_contrasena, confirmar_contrasena } =
		req.body;

	if (!id_usuario || !codigo || !nueva_contrasena || !confirmar_contrasena) {
		return res
			.status(400)
			.json({ mensaje: "Todos los campos son obligatorios." });
	}

	if (nueva_contrasena !== confirmar_contrasena) {
		return res
			.status(400)
			.json({ mensaje: "Las contraseñas no coinciden." });
	}

	try {
		const usuario = await User.findOne({ where: { id_usuario } });

		if (!usuario) {
			return res.status(404).json({ mensaje: "Usuario no encontrado." });
		}

		const registro = await RecuperacionContrasena.findOne({
			where: {
				id_usuario,
				token: codigo,
				estado: "activo",
			},
			order: [["fecha_expiracion", "DESC"]],
		});

		if (!registro) {
			return res
				.status(404)
				.json({ mensaje: "Código inválido o ya usado." });
		}

		if (new Date() > new Date(registro.fecha_expiracion)) {
			await registro.update({ estado: "inactivo" });
			return res.status(400).json({ mensaje: "El código ha expirado." });
		}

		const hashed = await bcrypt.hash(nueva_contrasena, 10);
		usuario.contrasena = hashed;
		await usuario.save();

		await registro.update({ estado: "inactivo" });

		return res
			.status(200)
			.json({ mensaje: "Contraseña actualizada correctamente." });
	} catch (error) {
		console.error("Error al cambiar contraseña:", error);
		return res.status(500).json({ mensaje: "Error interno del servidor." });
	}
};

const validarVidaToken = (req, res) => {
	const token = req.header("x-token");

	if (!token) {
		return res.status(401).json({ mensaje: "Token no proporcionado" });
	}

	if (invalidTokens.has(token)) {
		return res.status(401).json({ mensaje: "Token inválido o revocado" });
	}

	try {
		const decoded = jwt.verify(token, SECRET_KEY);
		return res
			.status(200)
			.json({ mensaje: "Token válido", id_usuario: decoded.uid });
	} catch (error) {
		console.error("Token inválido:", error);
		return res.status(401).json({ mensaje: "Token inválido o expirado" });
	}
};

module.exports = {
	login,
	logout,
	recuperarContraseña,
	verificarCodigoRecuperacion,
	cambiarContrasenaConCodigo,
	validarVidaToken,
};
