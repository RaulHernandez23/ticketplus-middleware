const express = require("express");
const router = express.Router();
const { validarToken } = require("../middlewares/validateToken");
const { enviarBoleto } = require("../controllers/boleto.controller");

router.post("/:id_boleto/enviar", validarToken, enviarBoleto);

module.exports = router;
