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
  mapaAsientos
} = require("../controllers/boleto.controller");

router.post("/:id_boleto/enviar", validarToken, enviarBoleto);
router.get("/reembolsables", validarToken, listarBoletosReembolsables);
router.get("/:id_boleto/detalle", validarToken, detalleBoleto);
router.post("/:id_boleto/reembolso", validarToken, solicitarReembolso);
router.get("/transferibles", validarToken, listarBoletosTransferibles);
router.post("/transferir", validarToken, transferirBoletos);
router.post("/registrar-venta", validarToken, registrarVenta);
router.get("/mapa", mapaAsientos);

module.exports = router;
