const express = require("express");
const router = express.Router();
const { obtenerCategorias } = require("../controllers/categoria.controller");

router.get("/", obtenerCategorias);

module.exports = router;