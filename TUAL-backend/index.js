// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import publicRoutes from "./src/routes/public.routes.js";
import authRoutes from "./src/routes/auth.routes.js";

import clientesRoutes from "./src/routes/clientes.routes.js";
import vehiculosRoutes from "./src/routes/vehiculos.routes.js";
import ordenesRoutes from "./src/routes/ordenes.routes.js";
import pagosRoutes from "./src/routes/pagos.routes.js";
import superadminRoutes from "./src/routes/superadmin.routes.js";

// import empresasRoutes from "./src/routes/empresas.routes.js";

import { authMiddleware } from "./src/middleware/authMiddleware.js";

dotenv.config();

const app = express();

/* ------------------------------------
   CONFIG
------------------------------------ */
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

/* ------------------------------------
   MIDDLEWARES GLOBALES
------------------------------------ */
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.use(express.json());

/* ------------------------------------
   RUTAS PÚBLICAS
------------------------------------ */
app.use(express.json());
app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);

/* ------------------------------------
   RUTAS PROTEGIDAS (APP)
------------------------------------ */
app.use("/api/clientes", authMiddleware, clientesRoutes);
app.use("/api/vehiculos", authMiddleware, vehiculosRoutes);
app.use("/api/ordenes", authMiddleware, ordenesRoutes);
app.use("/api/pagos", authMiddleware, pagosRoutes);
// app.use("/api/empresas", authMiddleware, empresasRoutes);

/* ------------------------------------
   HEALTHCHECK
------------------------------------ */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "TUAL backend" });
});


app.use("/api/superadmin", superadminRoutes);


/* ------------------------------------
   404
------------------------------------ */
app.use((req, res) => {
  res.status(404).json({
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

/* ------------------------------------
   MANEJO DE ERRORES
------------------------------------ */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
});

/* ------------------------------------
   SERVER
------------------------------------ */
app.listen(PORT, () => {
  console.log(`🚀 TUAL backend corriendo en http://localhost:${PORT}`);
});
