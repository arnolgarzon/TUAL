// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/* ------------------------------------
   CONFIGURACIÓN GENERAL
------------------------------------ */
const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

/* ------------------------------------
   MIDDLEWARES GLOBALES
------------------------------------ */

// Si estás detrás de proxy (Render/NGINX), habilita esto.
// app.set("trust proxy", 1);

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Logger sencillo (útil en dev)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

/* ------------------------------------
   RUTAS
------------------------------------ */
// 🌍 Públicas y Auth
import publicRoutes from "./src/routes/public.routes.js";
import authRoutes from "./src/routes/auth.routes.js";

// 🔐 Superadmin
import superadminRoutes from "./src/routes/superadmin.routes.js";

// 🏢 App por empresa
import clientesRoutes from "./src/routes/clientes.routes.js";
import vehiculosRoutes from "./src/routes/vehiculos.routes.js";
import ordenesRoutes from "./src/routes/ordenes.routes.js";
import pagosRoutes from "./src/routes/pagos.routes.js";

// 👥 Usuarios internos por empresa
import empresaUsuariosRoutes from "./src/routes/empresaUsuarios.routes.js";

// ✅ RBAC por empresa (NUEVO)
import permisosEmpresaRoutes from "./src/routes/permisosEmpresa.routes.js";

/* ------------------------------------
   RUTAS PÚBLICAS
------------------------------------ */
app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);

/* ------------------------------------
   RUTAS SUPERADMIN (CONTROL TOTAL)
------------------------------------ */
app.use("/api/superadmin", superadminRoutes);

/* ------------------------------------
   RUTAS RBAC EMPRESA (ADMIN_EMPRESA)
   /api/empresa/permisos
   /api/empresa/roles
   /api/empresa/roles/:rol/permisos
------------------------------------ */
app.use("/api/empresa", permisosEmpresaRoutes);

/* ------------------------------------
   RUTAS APP (cada router aplica auth / RBAC / módulos)
------------------------------------ */
app.use("/api/clientes", clientesRoutes);
app.use("/api/vehiculos", vehiculosRoutes);
app.use("/api/ordenes", ordenesRoutes);
app.use("/api/pagos", pagosRoutes);

// Usuarios internos (empresa)
app.use("/api/empresa/usuarios", empresaUsuariosRoutes);

/* ------------------------------------
   HEALTHCHECK
------------------------------------ */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "TUAL backend",
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/* ------------------------------------
   404 - RUTA NO ENCONTRADA
------------------------------------ */
app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

/* ------------------------------------
   MANEJO GLOBAL DE ERRORES
------------------------------------ */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);

  // Si alguien lanzó un objeto con status
  const status = err.status || err.statusCode || 500;

  // Mensaje seguro
  const message =
    status >= 500
      ? "Error interno del servidor"
      : err.message || "Error";

  res.status(status).json({
    error: status >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
    message,
    // En dev es útil ver más detalle; en prod no
    ...(process.env.NODE_ENV !== "production" && {
      detail: err.message,
      stack: err.stack,
    }),
  });
});

/* ------------------------------------
   INICIO DEL SERVIDOR
------------------------------------ */
app.listen(PORT, () => {
  console.log(`🚀 TUAL backend corriendo en http://localhost:${PORT}`);
  console.log(`🌐 CORS origin permitido: ${CLIENT_URL}`);
});