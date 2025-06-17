const express = require('express');
const router = express.Router();
const { obtenerPaises } = require('../controllers/pais.controller');

router.get('/', obtenerPaises);

module.exports = router;