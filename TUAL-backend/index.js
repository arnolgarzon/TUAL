// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

dotenv.config();

const app = express();

/* =====================================================
   CONFIGURACIÓN GENERAL
===================================================== */

const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV || "development";

// Si estás detrás de proxy (Render / Railway / Nginx)
if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

/* =====================================================
   MIDDLEWARES GLOBALES
===================================================== */

// 🛡 Seguridad básica HTTP
app.use(helmet());

// 🌍 CORS configurable
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 📦 Parseo de JSON
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// 📊 Logger profesional
if (NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* =====================================================
   RUTAS
===================================================== */

// 🌍 Públicas y autenticación
import publicRoutes from "./src/routes/public.routes.js";
import authRoutes from "./src/routes/auth.routes.js";

// 🔐 Superadmin
import superadminRoutes from "./src/routes/superadmin.routes.js";

// 🏢 Empresa - configuración SaaS
import permisosEmpresaRoutes from "./src/routes/permisosEmpresa.routes.js";
import empresaUsuariosRoutes from "./src/routes/empresaUsuarios.routes.js";
import empresaConfigRoutes from "./src/routes/empresaConfig.routes.js"; // NUEVO (módulos)

// 📦 Módulos funcionales
import clientesRoutes from "./src/routes/clientes.routes.js";
import vehiculosRoutes from "./src/routes/vehiculos.routes.js";
import ordenesRoutes from "./src/routes/ordenes.routes.js";
import pagosRoutes from "./src/routes/pagos.routes.js";

/* =====================================================
   RUTAS PÚBLICAS
===================================================== */
app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);

/* =====================================================
   SUPERADMIN
===================================================== */
app.use("/api/superadmin", superadminRoutes);

/* =====================================================
   EMPRESA (CONFIGURACIÓN + RBAC)
===================================================== */

// RBAC
app.use("/api/empresa", permisosEmpresaRoutes);

// Usuarios internos
app.use("/api/empresa/usuarios", empresaUsuariosRoutes);

// Configuración de empresa (módulos, nombre, etc)
app.use("/api/empresa/config", empresaConfigRoutes);

/* =====================================================
   MÓDULOS PRINCIPALES
===================================================== */

app.use("/api/clientes", clientesRoutes);
app.use("/api/vehiculos", vehiculosRoutes);
app.use("/api/ordenes", ordenesRoutes);
app.use("/api/pagos", pagosRoutes);

/* =====================================================
   HEALTHCHECK (Para deploy en nube)
===================================================== */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    app: "TUAL backend",
    env: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/* =====================================================
   404
===================================================== */
app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

/* =====================================================
   MANEJO GLOBAL DE ERRORES
===================================================== */
app.use((err, req, res, next) => {
  console.error("🔥 Error capturado:", err);

  const status = err.status || err.statusCode || 500;

  const response = {
    error: status >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
    message:
      status >= 500
        ? "Error interno del servidor"
        : err.message || "Error en la solicitud",
  };

  if (NODE_ENV !== "production") {
    response.detail = err.message;
    response.stack = err.stack;
  }

  res.status(status).json(response);
});

/* =====================================================
   INICIO DEL SERVIDOR
===================================================== */
app.listen(PORT, () => {
  console.log("======================================");
  console.log("🚀 TUAL BACKEND INICIADO");
  console.log(`📡 Puerto: ${PORT}`);
  console.log(`🌐 Entorno: ${NODE_ENV}`);
  console.log(`🔓 CORS permitido: ${CLIENT_URL}`);
  console.log("======================================");
});
