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
 * 🔐 TODAS las rutas aquí requieren:
 * - Token válido
 * - Rol superadmin
 */
router.use(authMiddleware);
router.use(authorizeRoles("superadmin"));

/**
 * 📊 Estado general del sistema
 */
router.get("/stats", getSystemStats);

/**
 * 🏢 Empresas registradas
 */
router.get("/empresas", listEmpresas);

/**
 * 👥 Usuarios del sistema
 */
router.get("/usuarios", listUsuarios);

export default router;
