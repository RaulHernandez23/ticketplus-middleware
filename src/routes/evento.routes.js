const express = require("express");
const router = express.Router();
const { obtenerEventos, obtenerDetallesEvento } = require("../controllers/evento.controller");

router.get("/", obtenerEventos);
router.get("/:id_evento", obtenerDetallesEvento);

module.exports = router;