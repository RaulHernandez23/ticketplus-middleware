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
} = require("../controllers/boleto.controller");

router.post("/:id_boleto/enviar", validarToken, enviarBoleto);
router.get("/reembolsables", validarToken, listarBoletosReembolsables);
router.get("/:id_boleto/detalle", validarToken, detalleBoleto);
router.post("/:id_boleto/reembolso", validarToken, solicitarReembolso);
router.get("/transferibles", validarToken, listarBoletosTransferibles);
router.post("/transferir", validarToken, transferirBoletos);

module.exports = router;
