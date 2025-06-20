const fs = require("fs");
const path = require("path");

const Usuario = require("../models/Usuario");
const Boleto = require("../models/Boleto");
const Evento = require("../models/Evento");
const FuncionPrecio = require("../models/FuncionPrecio");
const Funcion = require("../models/Funcion");
const Asiento = require("../models/Asiento");
const Zona = require("../models/Zona");
const generarPDF = require("../utils/generarPDF");
const enviarCorreo = require("../utils/enviarCorreo").enviarCorreo;
const Pago = require("../models/Pago");
const SolicitudReembolso = require("../models/SolicitudReembolso");
const TransferenciaBoleto = require("../models/TransferenciaBoleto");
const crypto = require("crypto");
const Descuento = require("../models/Descuento");
const MetodoPago = require("../models/MetodoPago");
const Tarjeta = require("../models/Tarjeta");
const Paypal = require("../models/Paypal");
const { v4: uuidv4 } = require("uuid");
const sequelize = require("../config/db");
const { Op } = require("sequelize");

const enviarBoleto = async (req, res) => {
  const id_boleto = req.params.id_boleto;
  const uid = req.uid;

  try {
    // Buscar el boleto
    const boleto = await Boleto.findOne({ where: { id_boleto } });
    if (!boleto)
      return res.status(404).json({ mensaje: "Boleto no encontrado" });

    // Validar que el boleto pertenece al usuario
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

    // Validar que el boleto está pagado
    if (boleto.estado !== "pagado")
      return res.status(409).json({ mensaje: "El boleto no está pagado" });

    //Buscar usuario y validar correo
    const usuario = await Usuario.findOne({ where: { id_usuario: uid } });
    if (!usuario || !usuario.correo || usuario.estado !== "activo") {
      return res.status(409).json({ mensaje: "Correo de usuario no válido" });
    }

    // Buscar datos del evento usando Funcion
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
    const recinto = await require("../models/Recinto").findOne({
      where: { id_recinto: funcion.id_recinto },
    });
    const asiento = await Asiento.findOne({
      where: { id_asiento: boleto.id_asiento },
    });
    const zona = await Zona.findOne({
      where: { id_zona: asiento.id_zona },
    });
    const pago = await Pago.findOne({
      where: { id_pago: boleto.id_pago },
    });

    // Armar string del lugar
    let lugar = "";
    if (recinto) {
      lugar = `${recinto.nombre}, ${recinto.calle} ${recinto.numero}, ${recinto.ciudad}`;
    }

    // Armar objeto detalles
    const detalles = {
      seccion: zona?.nombre || "-",
      fila: asiento?.fila || "-",
      asiento: asiento?.numero || "-",
      precio_boleto: Number(funcionPrecio?.precio) || 0,
      cargos_por_orden: Number(pago?.costo_servicio) || 0,
      total_devolucion: Number(pago?.monto_total) || 0,
      lugar, // ahora sí el lugar correcto
      fecha: funcion?.fecha || "",
    };

    // 6. Generar PDF
    let pdfBuffer;
    try {
      pdfBuffer = await generarPDF(boleto, usuario, evento, detalles);
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

    // Cambiar el estado del boleto a "reembolsado"
    boleto.estado = "reembolsado";
    await boleto.save();

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
      fecha: boleto.FuncionPrecio?.Funcion?.fecha || "",
      seccion: boleto.Asiento?.Zona?.nombre || "",
      fila: boleto.Asiento?.fila || "",
      asiento: boleto.Asiento?.numero || "",
      id_funcion: boleto.id_funcion,
      precio: Number(boleto.FuncionPrecio?.precio) || 0,
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
    // Buscar usuario destino por correo
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

    // Separar apellidos recibidos
    let apellidoPaterno = "";
    let apellidoMaterno = "";
    if (receptor.apellidos) {
      const partes = receptor.apellidos.trim().split(" ");
      apellidoPaterno = partes[0] || "";
      apellidoMaterno = partes.slice(1).join(" ") || "";
    }

    // Validar nombre y apellidos
    if (
      usuarioDestino.nombre.trim().toLowerCase() !==
        receptor.nombre.trim().toLowerCase() ||
      usuarioDestino.apellido_paterno.trim().toLowerCase() !==
        apellidoPaterno.trim().toLowerCase() ||
      usuarioDestino.apellido_materno.trim().toLowerCase() !==
        apellidoMaterno.trim().toLowerCase()
    ) {
      await t.rollback();
      return res.status(400).json({
        mensaje:
          "Los datos del receptor (nombre y apellidos) no coinciden con el correo proporcionado.",
      });
    }

    // Validar boletos originales
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

    // Validar que no hayan sido transferidos antes (deben tener estado "pagado" y NO existir en TransferenciaBoleto)
    for (const boleto of boletosOriginales) {
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
      if (boleto.estado !== "pagado") {
        await t.rollback();
        return res.status(400).json({
          mensaje: `El boleto con id ${boleto.id_boleto} no está disponible para transferir.`,
        });
      }
    }

    // Procesar transferencia
    for (const boleto of boletosOriginales) {
      // Marcar el boleto original como transferido
      boleto.estado = "transferido";
      await boleto.save({ transaction: t });

      // Crear nuevo boleto para el receptor (asegúrate de incluir id_funcion si es requerido)
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
          id_funcion: boleto.id_funcion, // <-- importante si tu modelo lo requiere
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

const registrarVenta = async (req, res) => {
  const { id_funcion, id_zona, id_asiento, id_metodo_pago, codigo_descuento } =
    req.body;
  const uid = req.uid; // Autenticación previa

  const t = await sequelize.transaction();
  try {
    // 1. Verifica que el asiento no esté ocupado
    const boletoExistente = await Boleto.findOne({
      where: {
        id_funcion,
        id_asiento,
        estado: ["pagado", "usado", "reservado"],
      },
      transaction: t,
    });

    if (boletoExistente) {
      await t.rollback();
      return res.status(409).json({ mensaje: "El asiento ya está ocupado." });
    }

    // 2. Buscar precio
    const funcionPrecio = await FuncionPrecio.findOne({
      where: { id_funcion, id_zona },
      transaction: t,
    });

    if (!funcionPrecio) {
      await t.rollback();
      return res
        .status(404)
        .json({ mensaje: "Precio no disponible para esta función/zona." });
    }

    let precio = parseFloat(funcionPrecio.precio);
    const costo_servicio = 10.0; // Fijo o configurable
    let descuento = 0;
    let id_descuento = null;

    // 3. Validar descuento si viene
    if (codigo_descuento) {
      const descuentoRow = await Descuento.findOne({
        where: {
          codigo: codigo_descuento,
          estado: "activo",
          fecha_inicio: { [Op.lte]: new Date() },
          fecha_fin: { [Op.gte]: new Date() },
        },
        transaction: t,
      });

      if (descuentoRow) {
        id_descuento = descuentoRow.id_descuento;
        descuento =
          descuentoRow.tipo === "porcentaje"
            ? (precio * descuentoRow.valor) / 100
            : descuentoRow.valor;
      }
    }

    const monto_total = precio + costo_servicio - descuento;

    // 4. Crear el pago
    const pago = await Pago.create(
      {
        costo_servicio,
        monto_total,
        fecha_pago: new Date(),
        estado: "procesando",
        id_descuento,
        id_metodo_pago,
      },
      { transaction: t }
    );

    // 5. Crear el boleto
    const codigo_qr = uuidv4();
    const url_codigo = `https://ticketplus.com/qr/${codigo_qr}`;

    const boleto = await Boleto.create(
      {
        id_evento_precio: funcionPrecio.id_funcion_precio,
        id_pago: pago.id_pago,
        id_usuario: uid,
        fecha_compra: new Date(),
        estado: "pagado",
        id_asiento,
        id_funcion,
        codigo_qr,
        url_codigo,
      },
      { transaction: t }
    );

    // 6. Actualizar pago
    await pago.update({ estado: "completado" }, { transaction: t });

    await t.commit();
    return res.status(201).json({
      mensaje: "Boleto vendido exitosamente.",
      id_boleto: boleto.id_boleto,
      url_codigo: boleto.url_codigo,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error en registrarVenta:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const obtenerZonasDeFuncion = async (req, res) => {
  const { id_funcion } = req.params;

  if (!id_funcion) {
    return res.status(400).json({ mensaje: "id_funcion es requerido" });
  }

  try {
    const funcionPrecios = await FuncionPrecio.findAll({
      where: { id_funcion },
      include: [{ model: Zona }],
      order: [["precio", "DESC"]],
    });

    if (funcionPrecios.length === 0) {
      return res.status(404).json({ mensaje: "No se encontraron zonas" });
    }

    const zonas = funcionPrecios.map((fp) => ({
      id_zona: fp.id_zona,
      nombre_zona: fp.Zona.nombre,
      precio: fp.precio,
      id_funcion_precio: fp.id_funcion_precio,
    }));

    return res.status(200).json(zonas);
  } catch (error) {
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const mapaAsientos = async (req, res) => {
  const { id_funcion, id_zona } = req.query;

  if (!id_funcion || !id_zona) {
    return res
      .status(400)
      .json({ mensaje: "id_funcion y id_zona son requeridos" });
  }

  try {
    // 1. Obtener todos los asientos de la zona
    const asientos = await Asiento.findAll({
      where: { id_zona },
      include: [{ model: Zona }],
      order: [
        ["fila", "ASC"],
        ["numero", "ASC"],
      ],
    });

    // 2. Obtener boletos ocupados para esa función
    const boletosOcupados = await Boleto.findAll({
      where: {
        id_funcion,
        estado: ["pagado", "reservado", "usado", "transferido"],
      },
      attributes: ["id_asiento"],
    });

    const asientosOcupados = new Set(boletosOcupados.map((b) => b.id_asiento));

    // 3. Armar estructura de mapa
    const resultado = asientos.map((asiento) => ({
      id_asiento: asiento.id_asiento,
      fila: asiento.fila,
      numero: asiento.numero,
      ocupado: asientosOcupados.has(asiento.id_asiento),
    }));

    return res.json(resultado);
  } catch (error) {
    console.error("Error al consultar mapa de asientos:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const obtenerBoletosDeFuncion = async (req, res) => {
  const { id_funcion } = req.params;

  try {
    const boletos = await Boleto.findAll({
      where: { id_funcion, estado: "pagado" },
      include: [
        {
          model: Asiento,
          include: [{ model: Zona }],
        },
      ],
    });

    return res.status(200).json(boletos);
  } catch (error) {
    console.error("Error al obtener boletos de la función:", error);
    throw new Error("Error al obtener boletos de la función");
  }
};

const obtenerMetodosPago = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const metodosPago = await MetodoPago.findAll({
      where: { id_usuario },
      attributes: ["id_metodo_pago", "alias", "tipo_metodo", "estado"],
    });

    if (metodosPago.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "No se encontraron métodos de pago" });
    }

    const metodosConTarjeta = metodosPago.filter(
      (metodo) => metodo.tipo_metodo === "tarjeta"
    );

    const metodosConPaypal = metodosPago.filter(
      (metodo) => metodo.tipo_metodo === "paypal"
    );

    const tarjetas = await Tarjeta.findAll({
      where: {
        id_metodo_pago: metodosConTarjeta.map((m) => m.id_metodo_pago),
      },
      attributes: [
        "id_metodo_pago",
        "numero_tarjeta_cifrado",
        "titular_tarjeta",
        "vencimiento_mes",
        "vencimiento_ano",
        "ultimos_cuatro",
      ],
      raw: true,
    });

    return res.status(200).json(tarjetas);
  } catch (error) {
    console.error("Error al obtener métodos de pago:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const obtenerEventoDeFuncion = async (req, res) => {
  const { id_funcion } = req.params;

  try {
    const funcion = await Funcion.findByPk(id_funcion, {
      include: [
        {
          model: Evento,
          attributes: ["id_evento", "titulo", "descripcion", "banner_url"],
        },
      ],
    });
    if (!funcion) {
      return res.status(404).json({ mensaje: "Función no encontrada" });
    }
    const evento = funcion.Evento;
    if (!evento) {
      return res.status(404).json({ mensaje: "Evento no encontrado" });
    }

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

    return res.status(200).json({
      id_evento: evento.id_evento,
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      banner_url: evento.banner_url,
      banner_base64,
    });
  } catch (error) {
    console.error("Error al obtener evento de función:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const descargarBoletoPDF = async (req, res) => {
  const uid = req.uid;
  const id_boleto = req.params.id_boleto;

  try {
    // Busca el boleto y valida que sea del usuario
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

    console.log("Descargar PDF: id_boleto:", id_boleto, "uid:", uid);

    if (!boleto) {
      console.error(
        "No se encontró el boleto con id:",
        id_boleto,
        "para el usuario:",
        uid
      );
      return res.status(404).json({ mensaje: "Boleto no encontrado" });
    }

    // Datos del usuario
    const usuario = await Usuario.findByPk(uid);

    // Datos del evento
    const evento = boleto.FuncionPrecio?.Funcion?.Evento;

    // Detalles para el PDF
    const funcion = boleto.FuncionPrecio?.Funcion;
    const zona = boleto.Asiento?.Zona || boleto.FuncionPrecio?.Zona;
    const asiento = boleto.Asiento;
    const pago = boleto.Pago;

    // Si el campo 'lugar' no existe en la función, lo armamos con el recinto
    let lugar = funcion?.lugar || "";
    if (!lugar && funcion?.id_recinto) {
      try {
        const recinto = await require("../models/Recinto").findOne({
          where: { id_recinto: funcion.id_recinto },
        });
        if (recinto) {
          lugar = `${recinto.nombre}, ${recinto.calle} ${recinto.numero}, ${recinto.ciudad}`;
        }
      } catch (err) {
        console.error("Error obteniendo recinto:", err);
      }
    }

    const detalles = {
      seccion: zona?.nombre || "-",
      fila: asiento?.fila || "-",
      asiento: asiento?.numero || "-",
      precio_boleto: Number(boleto.FuncionPrecio?.precio) || 0,
      cargos_por_orden: Number(pago?.costo_servicio) || 0,
      total_devolucion: Number(pago?.monto_total) || 0,
      lugar,
      fecha: funcion?.fecha || "",
    };

    // Validar que todos los datos requeridos existen
    if (!usuario || !evento || !funcion || !asiento || !zona || !pago) {
      console.error("Faltan datos requeridos para generar el PDF del boleto");
      return res.status(500).json({
        mensaje: "Faltan datos requeridos para generar el PDF del boleto",
      });
    }

    // Generar PDF
    let pdfBuffer;
    try {
      pdfBuffer = await generarPDF(boleto, usuario, evento, detalles);
      if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
        throw new Error("No se generó un buffer válido para el PDF");
      }
    } catch (err) {
      console.error("Error al generar el PDF:", err);
      return res.status(500).json({
        mensaje: "No se pudo generar tu boleto. Inténtalo de nuevo más tarde.",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=boleto_${id_boleto}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error al descargar PDF:", error);
    res.status(500).json({ mensaje: "Error al generar el PDF del boleto" });
  }
};

module.exports = {
  enviarBoleto,
  listarBoletosReembolsables,
  detalleBoleto,
  solicitarReembolso,
  listarBoletosTransferibles,
  transferirBoletos,
  registrarVenta,
  obtenerZonasDeFuncion,
  mapaAsientos,
  obtenerBoletosDeFuncion,
  obtenerMetodosPago,
  obtenerEventoDeFuncion,
  mapaAsientos,
  descargarBoletoPDF,
};
