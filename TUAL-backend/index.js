// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// 🌍 Rutas públicas y auth
import publicRoutes from "./src/routes/public.routes.js";
import authRoutes from "./src/routes/auth.routes.js";

// 🔐 Rutas de control absoluto
import superadminRoutes from "./src/routes/superadmin.routes.js";

// 🏢 Rutas de la aplicación (por empresa)
import clientesRoutes from "./src/routes/clientes.routes.js";
import vehiculosRoutes from "./src/routes/vehiculos.routes.js";
import ordenesRoutes from "./src/routes/ordenes.routes.js";
import pagosRoutes from "./src/routes/pagos.routes.js";

// 🔐 Middleware global de autenticación
import { authMiddleware } from "./src/middleware/authMiddleware.js";

dotenv.config();

const app = express();

/* ------------------------------------
   CONFIGURACIÓN GENERAL
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
app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);

/* ------------------------------------
   RUTAS SUPERADMIN (CONTROL TOTAL)
   🔥 No dependen de empresa
------------------------------------ */
app.use("/api/superadmin", superadminRoutes);

/* ------------------------------------
   RUTAS PROTEGIDAS POR EMPRESA (APP)
------------------------------------ */
app.use("/api/clientes", authMiddleware, clientesRoutes);
app.use("/api/vehiculos", authMiddleware, vehiculosRoutes);
app.use("/api/ordenes", authMiddleware, ordenesRoutes);
app.use("/api/pagos", authMiddleware, pagosRoutes);

/* ------------------------------------
   HEALTHCHECK
------------------------------------ */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "TUAL backend",
    timestamp: new Date()
  });
});

/* ------------------------------------
   404 - RUTA NO ENCONTRADA
------------------------------------ */
app.use((req, res) => {
  res.status(404).json({
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

/* ------------------------------------
   MANEJO GLOBAL DE ERRORES
------------------------------------ */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
});

/* ------------------------------------
   INICIO DEL SERVIDOR
------------------------------------ */
app.listen(PORT, () => {
  console.log(`🚀 TUAL backend corriendo en http://localhost:${PORT}`);
});
