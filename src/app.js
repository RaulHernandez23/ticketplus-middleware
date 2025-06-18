const express = require("express");
const app = express();
const usuarioRoutes = require("./routes/usuario.routes");
const authRoutes = require("./routes/auth.routes");
const boletoRoutes = require("./routes/boleto.routes");

app.use(express.json());
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/boletos", boletoRoutes);

module.exports = app;
