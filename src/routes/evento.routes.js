const express = require("express");
const router = express.Router();
const { obtenerEventos } = require("../controllers/evento.controller");

router.get("/", obtenerEventos);

module.exports = router;