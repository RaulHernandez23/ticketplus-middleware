const express = require("express");
const app = express();
const cors = require("cors");
const usuarioRoutes = require("./routes/usuario.routes");
const authRoutes = require("./routes/auth.routes");
const boletoRoutes = require("./routes/boleto.routes");
const paisRoutes = require("./routes/pais.routes");
const categoriaRoutes = require('./routes/categoria.routes');
const eventoRoutes = require('./routes/evento.routes');

app.use(cors());
app.use(express.json());
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/boletos", boletoRoutes);
app.use("/api/paises", paisRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/paises', paisRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/eventos', eventoRoutes);

module.exports = app;
