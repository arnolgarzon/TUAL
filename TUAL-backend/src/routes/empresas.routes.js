import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa } from "../controllers/empresas.controller.js";

const router = express.Router();

// ✅ Roles definidos correctamente en minúsculas
const ADMIN_ROLES = ['superadmin', 'admin_empresa']; 
const SUPER_ADMIN_ONLY = ['superadmin'];

// ✅ Aplicar middlewares de verificación de token y autorización de roles a las rutas
router.get('/', [verifyToken, authorizeRoles(ADMIN_ROLES)], getEmpresas);

router.post('/', [verifyToken, authorizeRoles(SUPER_ADMIN_ONLY)], createEmpresa);

router.put('/:id', [verifyToken, authorizeRoles(ADMIN_ROLES)], updateEmpresa);

router.delete('/:id', [verifyToken, authorizeRoles(SUPER_ADMIN_ONLY)], deleteEmpresa);

export default router;