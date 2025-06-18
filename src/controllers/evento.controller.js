const fs = require("fs");
const path = require("path");
const Evento = require("../models/Evento");

const obtenerEventos = async (req, res) => {
	try {
		const limit = parseInt(req.query.limit) || 5;
		const offset = parseInt(req.query.offset) || 0;

		const eventos = await Evento.findAll({
			limit,
			offset,
			order: [["titulo", "ASC"]],
		});

		const eventosConBanner = eventos.map((evento) => {
			try {
				const rutaBanner = path.join(
					__dirname,
					"..",
					"..",
					"public",
					"eventBanners",
					evento.banner_url
				);

				const ext = path.extname(evento.banner_url).slice(1); // 'jpg', 'png', etc.
				const imagen = fs.readFileSync(rutaBanner);
				const base64 = imagen.toString("base64");

				return {
					...evento.dataValues,
					banner_base64: `data:image/${ext};base64,${base64}`,
				};
			} catch (err) {
				console.error(
					`No se pudo cargar el banner para el evento "${evento.titulo}":`,
					err
				);
				return {
					...evento.dataValues,
					banner_base64: null,
				};
			}
		});

		return res.status(200).json(eventosConBanner);
	} catch (error) {
		console.error("Error al obtener eventos:", error);
		return res.status(500).json({ error: "Error al obtener eventos" });
	}
};

module.exports = {
	obtenerEventos,
};