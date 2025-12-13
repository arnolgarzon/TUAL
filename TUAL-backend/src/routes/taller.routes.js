import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { getOrdenes, getOrdenById, createOrden, updateOrdenEstado, deleteOrden } from "../controllers/taller.controller.js";

const router = express.Router();

// Roles que pueden interactuar con el módulo de taller
const TALLER_ROLES = ['superadmin', 'admin_empresa', 'empleado']; // Ampliamos para que empleados puedan crear órdenes
const ADMIN_ROLES = ['superadmin', 'admin_empresa'];

// Rutas CRUD para Órdenes de Taller
router.get('/', [verifyToken, authorizeRoles(TALLER_ROLES)], getOrdenes);
router.post('/', [verifyToken, authorizeRoles(TALLER_ROLES)], createOrden);
router.get('/:id', [verifyToken, authorizeRoles(TALLER_ROLES)], getOrdenById);

// Solo admins pueden cambiar el estado o eliminar
router.put('/:id/estado', [verifyToken, authorizeRoles(ADMIN_ROLES)], updateOrdenEstado);
router.delete('/:id', [verifyToken, authorizeRoles(ADMIN_ROLES)], deleteOrden);

export default router;