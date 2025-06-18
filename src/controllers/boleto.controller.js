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
const TransferenciaBoleto = require("../models/TransferenciaBoleto");
const crypto = require("crypto");
const sequelize = require("../config/db");

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

const listarBoletosTransferibles = async (req, res) => {
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

const transferirBoletos = async (req, res) => {
  const uid = req.uid;
  const { boletos, receptor } = req.body;

  const t = await sequelize.transaction();
  try {
    //Validar receptor
    const usuarioDestino = await Usuario.findOne({
      where: { correo: receptor.correo },
      transaction: t,
    });
    if (!usuarioDestino) {
      await t.rollback();
      return res.status(404).json({
        mensaje:
          "Error: El correo electrónico ingresado no está asociado a una cuenta de TicketPlus.",
      });
    }

    //Validar boletos
    const boletosOriginales = await Boleto.findAll({
      where: {
        id_boleto: boletos,
        id_usuario: uid,
        estado: "pagado",
      },
      transaction: t,
    });

    if (boletosOriginales.length !== boletos.length) {
      await t.rollback();
      return res
        .status(400)
        .json({ mensaje: "Uno o más boletos no son válidos para transferir." });
    }

    //Procesar transferencia
    for (const boleto of boletosOriginales) {
      // Verifica si ya existe una transferencia para este boleto
      const yaTransferido = await TransferenciaBoleto.findOne({
        where: { id_boleto: boleto.id_boleto },
        transaction: t,
      });
      if (yaTransferido) {
        await t.rollback();
        return res.status(400).json({
          mensaje: `El boleto con id ${boleto.id_boleto} ya fue transferido anteriormente.`,
        });
      }
      boleto.estado = "transferido";
      await boleto.save({ transaction: t });

      const nuevoQR = require("crypto").randomBytes(8).toString("hex");
      const nuevaUrl = `https://qr.com/${nuevoQR}`;

      const nuevoBoleto = await Boleto.create(
        {
          id_evento_precio: boleto.id_evento_precio,
          id_pago: boleto.id_pago,
          id_usuario: usuarioDestino.id_usuario,
          fecha_compra: new Date(),
          estado: "pagado",
          id_asiento: boleto.id_asiento,
          codigo_qr: nuevoQR,
          url_codigo: nuevaUrl,
        },
        { transaction: t }
      );

      await TransferenciaBoleto.create(
        {
          id_boleto: boleto.id_boleto,
          id_usuario_origen: uid,
          id_usuario_destino: usuarioDestino.id_usuario,
          fecha_transferencia: new Date(),
          tipo_transferencia: "regalo",
        },
        { transaction: t }
      );
    }

    await t.commit();

    // Enviar los boletos por correo después del commit
    for (const boleto of boletosOriginales) {
      try {
        const funcionPrecio = await FuncionPrecio.findOne({
          where: { id_funcion_precio: boleto.id_evento_precio },
        });
        const funcion = await Funcion.findOne({
          where: { id_funcion: funcionPrecio.id_funcion },
        });
        const evento = await Evento.findOne({
          where: { id_evento: funcion.id_evento },
        });
        const nuevoBoleto = await Boleto.findOne({
          where: {
            id_usuario: usuarioDestino.id_usuario,
            id_asiento: boleto.id_asiento,
            id_evento_precio: boleto.id_evento_precio,
          },
        });
        const pdfBuffer = await generarPDF(nuevoBoleto, usuarioDestino, evento);
        await enviarCorreo(
          usuarioDestino.correo,
          `TicketPlus – Te han transferido un boleto para ${evento.titulo}`,
          `¡Hola ${usuarioDestino.nombre}! Has recibido un boleto para el evento "${evento.titulo}".`,
          pdfBuffer
        );
      } catch (err) {
        console.error("Error enviando correo de boleto transferido:", err);
      }
    }

    return res.status(200).json({ mensaje: "Transferencia exitosa" });
  } catch (error) {
    await t.rollback();
    console.error("Error al transferir boletos:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = {
  enviarBoleto,
  listarBoletosReembolsables,
  detalleBoleto,
  solicitarReembolso,
  listarBoletosTransferibles,
  transferirBoletos,
};
