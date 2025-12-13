import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { getVehiculos, getVehiculoById, createVehiculo, updateVehiculo, deleteVehiculo } from "../controllers/vehiculos.controller.js";

const router = express.Router();

// Roles que pueden interactuar con el módulo de vehículos
const ALLOWED_ROLES = ['superadmin', 'admin_empresa', 'empleado'];
const ADMIN_ROLES = ['superadmin', 'admin_empresa'];

// Rutas CRUD para Vehículos
router.get('/', [verifyToken, authorizeRoles(ALLOWED_ROLES)], getVehiculos);
router.post('/', [verifyToken, authorizeRoles(ALLOWED_ROLES)], createVehiculo);
router.get('/:id', [verifyToken, authorizeRoles(ALLOWED_ROLES)], getVehiculoById);

// Solo admins pueden actualizar o eliminar
router.put('/:id', [verifyToken, authorizeRoles(ADMIN_ROLES)], updateVehiculo);
router.delete('/:id', [verifyToken, authorizeRoles(ADMIN_ROLES)], deleteVehiculo);

export default router;