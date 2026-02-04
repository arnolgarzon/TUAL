// src/routes/superadmin.routes.js
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  getSystemStats,
  listEmpresas,
  getEmpresaDetail,
  toggleEmpresa,
  listUsuariosAuth,
  toggleUsuarioAuth,
  listClientesGlobal,
} from "../controllers/superadmin.controller.js";

const router = Router();

/**
 * ✅ Valida que :id sea entero positivo
 */
const validateIdParam = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID inválido" });
  }
  next();
};

/**
 * 🔒 Todo lo que esté debajo requiere:
 * - JWT válido
 * - rol superadmin
 */
router.use(authMiddleware);
router.use(authorizeRoles("superadmin"));

/**
 * 📊 Métricas globales TUAL
 */
router.get("/stats", getSystemStats);

/**
 * 🏢 Empresas
 */
router.get("/empresas", listEmpresas);
router.get("/empresas/:id", validateIdParam, getEmpresaDetail);
router.patch("/empresas/:id/estado", validateIdParam, toggleEmpresa);

/**
 * 👥 Usuarios (tabla usuarios - autenticación)
 */
router.get("/usuarios-auth", listUsuariosAuth);
router.patch("/usuarios-auth/:id/estado", validateIdParam, toggleUsuarioAuth);

/**
 * 👤 Clientes global (todas las empresas)
 */
router.get("/clientes", listClientesGlobal);

export default router;