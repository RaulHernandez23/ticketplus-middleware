const Usuario = require("../models/Usuario");
const Boleto = require("../models/Boleto");
const Evento = require("../models/Evento");
const FuncionPrecio = require("../models/FuncionPrecio");
const Funcion = require("../models/Funcion");
const Asiento = require("../models/Asiento");
const Zona = require("../models/Zona");
const generarPDF = require("../utils/generarPDF");
const enviarCorreo = require("../utils/enviarCorreo");
const Pago = require("../models/Pago");
const SolicitudReembolso = require("../models/SolicitudReembolso");

const enviarBoleto = async (req, res) => {
  const id_boleto = req.params.id_boleto;
  const uid = req.uid;

  try {
    // 1. Buscar el boleto
    const boleto = await Boleto.findOne({ where: { id_boleto } });
    if (!boleto)
      return res.status(404).json({ mensaje: "Boleto no encontrado" });

    // 2. Validar que el boleto pertenece al usuario
    console.log(
      "DEBUG - boleto.id_usuario:",
      boleto.id_usuario,
      "typeof:",
      typeof boleto.id_usuario
    );
    console.log("DEBUG - uid:", uid, "typeof:", typeof uid);

    if (Number(boleto.id_usuario) !== Number(uid)) {
      console.log("DEBUG - Los IDs NO son iguales");
      return res
        .status(409)
        .json({ mensaje: "El usuario no es el propietario del boleto" });
    } else {
      console.log("DEBUG - Los IDs son iguales");
    }

    // 3. Validar que el boleto está pagado
    if (boleto.estado !== "pagado")
      return res.status(409).json({ mensaje: "El boleto no está pagado" });

    // 4. Buscar usuario y validar correo
    const usuario = await Usuario.findOne({ where: { id_usuario: uid } });
    if (!usuario || !usuario.correo || usuario.estado !== "activo") {
      return res.status(409).json({ mensaje: "Correo de usuario no válido" });
    }

    // 5. Buscar datos del evento correctamente (usando Funcion)
    const funcionPrecio = await FuncionPrecio.findOne({
      where: { id_funcion_precio: boleto.id_evento_precio },
    });
    if (!funcionPrecio) {
      return res
        .status(404)
        .json({ mensaje: "Precio de función no encontrado" });
    }
    const funcion = await Funcion.findOne({
      where: { id_funcion: funcionPrecio.id_funcion },
    });
    if (!funcion) {
      return res.status(404).json({ mensaje: "Función no encontrada" });
    }
    const evento = await Evento.findOne({
      where: { id_evento: funcion.id_evento },
    });
    if (!evento) {
      return res.status(404).json({ mensaje: "Evento no encontrado" });
    }

    // 6. Generar PDF
    let pdfBuffer;
    try {
      pdfBuffer = await generarPDF(boleto, usuario, evento);
    } catch (err) {
      return res.status(500).json({
        mensaje: "No se pudo generar tu boleto. Inténtalo de nuevo más tarde.",
      });
    }

    // 7. Enviar correo
    try {
      await enviarCorreo(
        usuario.correo,
        `TicketPlus – Tu boleto para ${evento.titulo}`,
        `Adjunto encontrarás tu boleto digital para el evento "${evento.titulo}".`,
        pdfBuffer
      );
    } catch (err) {
      console.error("ERROR ENVIANDO CORREO:", err);
      return res.status(500).json({
        mensaje: "Error al enviar tu boleto. Por favor, inténtalo más tarde.",
      });
    }

    return res
      .status(200)
      .json({ mensaje: `Boleto enviado a ${usuario.correo}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const listarBoletosReembolsables = async (req, res) => {
  const uid = req.uid;
  try {
    const boletos = await Boleto.findAll({
      where: { id_usuario: uid, estado: "pagado" },
      include: [
        {
          model: FuncionPrecio,
          include: [
            {
              model: Funcion,
              include: [{ model: Evento }],
            },
            {
              model: Zona,
            },
          ],
        },
        {
          model: Asiento,
          include: [{ model: Zona }],
        },
      ],
    });

    const resultado = boletos.map((boleto) => ({
      id_boleto: boleto.id_boleto,
      evento: boleto.FuncionPrecio?.Funcion?.Evento?.titulo || "",
      fecha: boleto.FuncionPrecio?.Funcion?.fecha || "",
      seccion: boleto.Asiento?.Zona?.nombre || "",
      fila: boleto.Asiento?.fila || "",
      asiento: boleto.Asiento?.numero || "",
    }));

    return res.json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const detalleBoleto = async (req, res) => {
  const uid = req.uid;
  const id_boleto = req.params.id_boleto;

  try {
    const boleto = await Boleto.findOne({
      where: { id_boleto, id_usuario: uid },
      include: [
        {
          model: FuncionPrecio,
          include: [
            {
              model: Funcion,
              include: [{ model: Evento }],
            },
            {
              model: Zona,
            },
          ],
        },
        {
          model: Asiento,
          include: [{ model: Zona }],
        },
        {
          model: Pago,
        },
      ],
    });

    if (!boleto) {
      return res.status(404).json({ mensaje: "Boleto no encontrado" });
    }

    // Datos Del boleto
    const evento = boleto.FuncionPrecio?.Funcion?.Evento;
    const funcion = boleto.FuncionPrecio?.Funcion;
    const zona = boleto.Asiento?.Zona || boleto.FuncionPrecio?.Zona;
    const asiento = boleto.Asiento;
    const pago = boleto.Pago;

    const detalle = {
      id_boleto: boleto.id_boleto,
      evento: evento?.titulo || "",
      fecha: funcion?.fecha || "",
      seccion: zona?.nombre || "",
      fila: asiento?.fila || "",
      asiento: asiento?.numero || "",
      precio_boleto: Number(boleto.FuncionPrecio?.precio) || 0,
      cargos_por_orden: Number(pago?.costo_servicio) || 0,
      total_devolucion: Number(pago?.monto_total) || 0,
    };

    return res.json(detalle);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const solicitarReembolso = async (req, res) => {
  const uid = req.uid;
  const id_boleto = req.params.id_boleto;
  const { motivo, comentario } = req.body;

  try {
    // 1. Validar que el boleto existe, pertenece al usuario y está pagado
    const boleto = await Boleto.findOne({
      where: { id_boleto, id_usuario: uid },
    });
    if (!boleto)
      return res
        .status(404)
        .json({ mensaje: "Boleto no encontrado o no autorizado" });
    if (boleto.estado !== "pagado")
      return res.status(409).json({ mensaje: "El boleto no es reembolsable" });

    // 2. Registrar la solicitud de reembolso (motivo + comentario juntos)
    const motivoCompleto = comentario ? `${motivo} - ${comentario}` : motivo;

    await SolicitudReembolso.create({
      id_boleto,
      motivo: motivoCompleto,
      estado: "pendiente",
    });

    return res
      .status(200)
      .json({ mensaje: "Solicitud de reembolso registrada" });
  } catch (error) {
    console.error("Error al solicitar reembolso:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  enviarBoleto,
  listarBoletosReembolsables,
  detalleBoleto,
  solicitarReembolso,
};
