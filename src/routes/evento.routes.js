const express = require("express");
const router = express.Router();
const { obtenerEventos, obtenerDetallesEvento, agregarEventoFavorito, eliminarEventoFavorito, obtenerEventosFavoritos, crearValoracion, verificarValoracion, obtenerZonasConPrecios } = require("../controllers/evento.controller");

router.get("/", obtenerEventos);
router.get("/favoritos/:id_usuario", obtenerEventosFavoritos);
router.post("/favorito", agregarEventoFavorito);
router.delete("/favorito", eliminarEventoFavorito);
router.get("/:id_evento", obtenerDetallesEvento);
router.post("/valoracion", crearValoracion);
router.get("/zonas-precios/:id_evento", obtenerZonasConPrecios);
router.get("/valoracion/:id_evento/:id_usuario", verificarValoracion);

module.exports = router;