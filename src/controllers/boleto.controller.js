const Usuario = require("../models/Usuario");
const Boleto = require("../models/Boleto");
const Evento = require("../models/Evento");
const FuncionPrecio = require("../models/FuncionPrecio");
const Funcion = require("../models/Funcion"); // Asegúrate de tener este modelo
const generarPDF = require("../utils/generarPDF");
const enviarCorreo = require("../utils/enviarCorreo");

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

module.exports = { enviarBoleto };
