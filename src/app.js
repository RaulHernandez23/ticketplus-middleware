const express = require('express');
const app = express();
const usuarioRoutes = require('./routes/usuario.routes');

app.use(express.json());
app.use('/api/usuarios', usuarioRoutes);

module.exports = app;
