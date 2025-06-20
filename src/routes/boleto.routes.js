const express = require("express");
const router = express.Router();
const { validarToken } = require("../middlewares/validateToken");
const {
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
} = require("../controllers/boleto.controller");

router.post("/:id_boleto/enviar", validarToken, enviarBoleto);
router.get("/reembolsables", validarToken, listarBoletosReembolsables);
router.get("/:id_boleto/detalle", validarToken, detalleBoleto);
router.post("/:id_boleto/reembolso", validarToken, solicitarReembolso);
router.get("/transferibles", validarToken, listarBoletosTransferibles);
router.post("/transferir", validarToken, transferirBoletos);
router.post("/registrar-venta", validarToken, registrarVenta);
router.get("/zonas/:id_funcion", obtenerZonasDeFuncion);
router.get("/mapa", mapaAsientos);
router.get("/pagados/:id_funcion", obtenerBoletosDeFuncion);
router.get("/metodos-pago/:id_usuario", validarToken, obtenerMetodosPago);
router.get("/evento/:id_funcion", obtenerEventoDeFuncion);

module.exports = router;
