import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import eventoRoutes from "./routes/evento.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/eventos", eventoRoutes);

export default app;
