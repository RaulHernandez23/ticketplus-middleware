const User = require("../models/Usuario");
const bcrypt = require("bcrypt");
const { generarJWT } = require("../middlewares/generateToken");
const { invalidarJWT } = require("../middlewares/deleteToken");

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
}

module.exports = {
	login,
	logout,
};