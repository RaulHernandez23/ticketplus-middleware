const express = require('express');
const router = express.Router();
const { obtenerPaises } = require('../controllers/pais.controller');
const { obtenerPaisesPorId } = require('../controllers/pais.controller');

router.get('/', obtenerPaises);
router.get('/:id', obtenerPaisesPorId);

module.exports = router;