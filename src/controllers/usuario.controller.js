const Usuario = require("../models/Usuario");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const registrarUsuario = async (req, res) => {
	try {
		const {
			nombre,
			apellido_paterno,
			apellido_materno,
			correo,
			contrasena,
			confirmar_contrasena,
			codigo_postal,
			id_pais,
		} = req.body;

		if (
			!nombre ||
			!apellido_paterno ||
			!correo ||
			!contrasena ||
			!confirmar_contrasena ||
			!codigo_postal ||
			!id_pais
		) {
			return res
				.status(400)
				.json({
					mensaje:
						"Todos los campos obligatorios deben estar completos.",
				});
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
			return res
				.status(400)
				.json({ mensaje: "El correo no tiene un formato válido." });
		}

		if (contrasena !== confirmar_contrasena) {
			return res
				.status(400)
				.json({ mensaje: "Las contraseñas no coinciden." });
		}

		if (contrasena.length < 8) {
			return res
				.status(400)
				.json({
					mensaje: "La contraseña debe tener al menos 8 caracteres.",
				});
		}

		const existente = await Usuario.findOne({ where: { correo } });
		if (existente) {
			return res
				.status(409)
				.json({ mensaje: "Este correo ya está registrado." });
		}

		const hash = await bcrypt.hash(contrasena, 10);

		await Usuario.create({
			nombre,
			apellido_paterno,
			apellido_materno,
			correo,
			contrasena: hash,
			codigo_postal,
			id_pais,
			estado: "activo",
			fecha_registro: new Date(),
		});

		return res.status(201).json({ mensaje: "Registro exitoso." });
	} catch (error) {
		console.error("Error en registro:", error);
		return res
			.status(500)
			.json({
				mensaje: "Ocurrió un error inesperado. Inténtalo más tarde.",
			});
	}
};

module.exports = {
	registrarUsuario,
};
