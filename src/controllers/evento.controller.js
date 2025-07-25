const fs = require("fs");
const path = require("path");
const { Evento, Funcion, Recinto } = require("../models/Asociaciones");
const Favorito = require("../models/EventoFavorito");
const ValoracionEvento = require("../models/ValoracionEvento");
const FuncionPrecio = require("../models/FuncionPrecio");
const Zona = require("../models/Zona");

const obtenerEventos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
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

        const ext = path.extname(evento.banner_url).slice(1);
        const imagen = fs.readFileSync(rutaBanner);
        const base64 = imagen.toString("base64");

        return {
          ...evento.dataValues,
          banner_base64: `data:image/${ext};base64,${base64}`,
        };
      } catch (err) {
        console.warn(`No se pudo cargar el banner para "${evento.titulo}"`);
        return { ...evento.dataValues, banner_base64: null };
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
      console.warn("No se pudo cargar la imagen del banner:", err.message);
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

const agregarEventoFavorito = async (req, res) => {
  const { id_usuario, id_evento } = req.body;

  try {
    await Favorito.create({ id_usuario, id_evento });
    return res.status(201).json({ mensaje: "Favorito agregado" });
  } catch (error) {
    console.error("Error al agregar favorito:", error);
    return res.status(500).json({ error: "No se pudo agregar el favorito" });
  }
};

const eliminarEventoFavorito = async (req, res) => {
  const { id_usuario, id_evento } = req.body;

  try {
    const deleted = await Favorito.destroy({
      where: { id_usuario, id_evento },
    });

    if (deleted === 0) {
      return res.status(404).json({ error: "Favorito no encontrado" });
    }

    return res.status(200).json({ mensaje: "Favorito eliminado" });
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    return res.status(500).json({ error: "No se pudo eliminar el favorito" });
  }
};

const obtenerEventosFavoritos = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const favoritos = await Favorito.findAll({
      where: { id_usuario },
      attributes: ['id_evento']
    });

    const idsFavoritos = favoritos.map(f => f.id_evento);
    res.status(200).json({ eventosFavoritos: idsFavoritos });
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    res.status(500).json({ error: "No se pudieron obtener los favoritos" });
  }
};

const crearValoracion = async (req, res) => {
  const { id_usuario, id_evento, calificacion, comentario } = req.body;

  if (!id_usuario || !id_evento || !calificacion) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    await ValoracionEvento.create({
      id_usuario,
      id_evento,
      calificacion,
      comentario
    });

    return res.status(201).json({ mensaje: "Valoración creada correctamente" });
  } catch (error) {
    console.error("Error al guardar valoración:", error);
    return res.status(500).json({ error: "No se pudo guardar la valoración" });
  }
};

const verificarValoracion = async (req, res) => {
  const { id_evento, id_usuario } = req.params;

  try {
    const valoracion = await ValoracionEvento.findOne({
      where: { id_evento, id_usuario },
    });

    if (valoracion) {
      return res.status(200).json({ valorado: true });
    }

    return res.status(200).json({ valorado: false });
  } catch (error) {
    console.error("Error al verificar valoración:", error);
    return res.status(500).json({ error: "Error al verificar valoración" });
  }
};

const obtenerZonasConPrecios = async (req, res) => {
  const { id_evento } = req.params;

  try {
    const funcion = await Funcion.findOne({ where: { id_evento } });
    if (!funcion) {
      return res.status(404).json({ error: "Función no encontrada para este evento" });
    }

    const precios = await FuncionPrecio.findAll({
      where: { id_funcion: funcion.id_funcion },
      include: [{ model: Zona }]
    });

    const resultado = precios.map(fp => ({
      tipo: fp.Zona.nombre,
      precio: `$${fp.precio.toLocaleString("es-MX")}`
    }));

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Error al obtener zonas y precios:", error);
    return res.status(500).json({ error: "Error al obtener zonas y precios" });
  }
};

module.exports = {
  obtenerEventos,
  obtenerDetallesEvento,
  agregarEventoFavorito,
  eliminarEventoFavorito,
  obtenerEventosFavoritos,
  crearValoracion,
  verificarValoracion,
  obtenerZonasConPrecios,
};