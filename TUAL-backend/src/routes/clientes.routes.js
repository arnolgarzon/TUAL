import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { getClientes, getClienteById, createCliente, updateCliente, deleteCliente } from "../controllers/clientes.controller.js";

const router = express.Router();

// Roles que pueden interactuar con el módulo de clientes
const ALLOWED_ROLES = ['superadmin', 'admin_empresa', 'empleado'];
const ADMIN_ROLES = ['superadmin', 'admin_empresa'];

// Rutas CRUD para Clientes
router.get('/', [verifyToken, authorizeRoles(ALLOWED_ROLES)], getClientes);
router.post('/', [verifyToken, authorizeRoles(ALLOWED_ROLES)], createCliente);
router.get('/:id', [verifyToken, authorizeRoles(ALLOWED_ROLES)], getClienteById);

// Solo admins pueden actualizar o eliminar
router.put('/:id', [verifyToken, authorizeRoles(ADMIN_ROLES)], updateCliente);
router.delete('/:id', [verifyToken, authorizeRoles(ADMIN_ROLES)], deleteCliente);

export default router;