const fs = require("fs");
const path = require("path");
const { Evento, Funcion, Recinto } = require("../models/DetallesEvento");

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

const obtenerDetallesEvento = async (req, res) => {
  const { id_evento } = req.params;

  try {
    const evento = await Evento.findByPk(id_evento);
    if (!evento) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    const funcion = await Funcion.findOne({
      where: { id_evento },
      include: Recinto,
    });

    let banner_base64 = null;
    try {
      const rutaBanner = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "eventBanners",
        evento.banner_url
      );
      const ext = path.extname(evento.banner_url).slice(1);
      const imagen = fs.readFileSync(rutaBanner);
      banner_base64 = `data:image/${ext};base64,${imagen.toString("base64")}`;
    } catch (err) {
      console.error("Error al cargar la imagen del banner:", err);
    }

    const recinto = funcion?.Recinto;

    return res.status(200).json({
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      banner_base64,
      fecha_funcion: funcion?.fecha_funcion || null,
      recinto: recinto
        ? {
            nombre: recinto.nombre,
            calle: recinto.calle,
            numero: recinto.numero,
            ciudad: recinto.ciudad,
            estado: recinto.estado,
          }
        : null,
    });
  } catch (error) {
    console.error("Error al obtener detalles del evento:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
	obtenerEventos,
	obtenerDetallesEvento,
};