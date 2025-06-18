const Evento = require("../models/Evento");

const obtenerEventos = async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const eventos = await Evento.findAll({
      limit,
      offset,
      order: [["id_evento", "ASC"]],
    });

    res.json(eventos);
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    res.status(500).json({ error: "Error al obtener eventos" });
  }
};

module.exports = {
  obtenerEventos,
};
