// src/routes/index.js
import express from "express";
import empresasRoutes from "./empresas.routes.js";
import usuariosRoutes from "./usuarios.routes.js";
import authRoutes from "./auth.routes.js";



const router = express.Router();

router.use("/auth", authRoutes); // esto crea /api/auth
router.use("/empresas", empresasRoutes); // esto crea /api/empresas
router.use("/usuarios", usuariosRoutes);

export default router;
