import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  listPermisosCatalogo,
  listRolesEmpresa,
  getPermisosByRol,
  replacePermisosByRol,
} from "../controllers/permisosEmpresa.controller.js";

const router = Router();

/**
 * Solo admin_empresa (y superadmin por si entra).
 * Nota: esto protege la administración de permisos.
 */
router.use(authMiddleware);
router.use(authorizeRoles("admin_empresa", "superadmin"));

// GET /api/empresa/permisos
router.get("/permisos", listPermisosCatalogo);

// GET /api/empresa/roles
router.get("/roles", listRolesEmpresa);

// GET /api/empresa/roles/:rol/permisos
router.get("/roles/:rol/permisos", getPermisosByRol);

// PUT /api/empresa/roles/:rol/permisos  body: { permisos: ['clientes.ver', ...] }
router.put("/roles/:rol/permisos", replacePermisosByRol);

export default router;