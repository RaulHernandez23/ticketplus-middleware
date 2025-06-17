const express = require('express');
const app = express();
const usuarioRoutes = require('./routes/usuario.routes');
const authRoutes = require('./routes/auth.routes');
const paisRoutes = require('./routes/pais.routes');

app.use(express.json());
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/paises', paisRoutes);

module.exports = app;
