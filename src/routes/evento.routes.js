const express = require("express");
const router = express.Router();
const { obtenerEventos, obtenerDetallesEvento, agregarEventoFavorito, eliminarEventoFavorito, obtenerEventosFavoritos } = require("../controllers/evento.controller");

router.get("/", obtenerEventos);
router.get("/favoritos/:id_usuario", obtenerEventosFavoritos);
router.post("/favorito", agregarEventoFavorito);
router.delete("/favorito", eliminarEventoFavorito);
router.get("/:id_evento", obtenerDetallesEvento);

module.exports = router;