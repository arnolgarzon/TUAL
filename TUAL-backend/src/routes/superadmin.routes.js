import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  getSystemStats,
  listEmpresas,
  listUsuarios
} from "../controllers/superadmin.controller.js";

const router = Router();

/**
 * 🔐 Todas las rutas requieren:
 * - Token válido
 * - Rol superadmin
 */
router.use(authMiddleware);
router.use(authorizeRoles("superadmin"));

/**
 * 📊 Estado del sistema
 */
router.get("/stats", getSystemStats);

/**
 * 🏢 Empresas
 */
router.get("/empresas", listEmpresas);

/**
 * 👥 Usuarios
 */
router.get("/usuarios", listUsuarios);

export default router;
