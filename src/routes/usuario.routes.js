const express = require('express');
const router = express.Router();
const { validarToken } = require("../middlewares/validateToken");
const { registrarUsuario } = require('../controllers/usuario.controller');
const { actualizarUsuario } = require('../controllers/usuario.controller');
const { recuperarUsuario } = require('../controllers/usuario.controller');

router.post('/registro', registrarUsuario);
router.put('/actualizar-perfil', [validarToken], actualizarUsuario);
router.get('/recuperar-perfil/:id_usuario', [validarToken], recuperarUsuario);

module.exports = router;
