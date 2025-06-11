const express = require('express');
const router = express.Router();
const { registrarUsuario } = require('../controllers/usuario.controller');

router.post('/registro', registrarUsuario);

module.exports = router;
