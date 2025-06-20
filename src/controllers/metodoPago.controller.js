// importaciones necesarias
const bcrypt = require("bcrypt");

const MetodoPago = require("../models/MetodoPago");
const Tarjeta = require("../models/Tarjeta");
const Paypal = require("../models/Paypal");

const crearMetodoPago = async (req, res) => {
  const { alias, tipo_metodo, datos, id_usuario } = req.body;

  try {
    if (!["paypal", "tarjeta"].includes(tipo_metodo)) {
      return res.status(400).json({
        mensaje: "Tipo de método no válido. Solo se permite tarjeta o PayPal.",
      });
    }

    const nuevoMetodo = await MetodoPago.create({
      alias,
      tipo_metodo,
      fecha_registro: new Date(),
      estado: true,
      id_usuario,
    });

    const numero_tarjeta_cifrado = bcrypt.hashSync(datos.numero_tarjeta, 10);

    if (tipo_metodo === "tarjeta") {
      await Tarjeta.create({
        id_metodo_pago: nuevoMetodo.id_metodo_pago,
        numero_tarjeta_cifrado,
        titular_tarjeta: datos.titular_tarjeta,
        vencimiento_mes: datos.vencimiento_mes,
        vencimiento_ano: datos.vencimiento_ano,
        ultimos_cuatro: datos.ultimos_cuatro,
      });
    } else if (tipo_metodo === "paypal") {
      await Paypal.create({
        id_metodo_pago: nuevoMetodo.id_metodo_pago,
        correo_paypal: datos.correo_paypal,
      });
    }

    return res.status(201).json({
      mensaje: "Método de pago registrado exitosamente",
      metodo: nuevoMetodo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al registrar el método de pago",
    });
  }
};

module.exports = {
  crearMetodoPago,
};
