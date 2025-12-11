// ✅ 1. Importar express
import express from "express";

// ✅ 2. Importar los controladores de usuario
// ASUNCIÓN: Las funciones CRUD están en `usuarios.controller.js`
import { 
    listAllUsers, 
    getUsuarioById, 
    createUser, 
    updateUsuario, 
    deleteUsuario 
} from '../controllers/usuarios.controller.js';

// Importar Middlewares de Seguridad y Autorización
import { verifyToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

// Roles permitidos para las operaciones de administración de usuarios
const SUPER_ADMIN_ONLY = ['superadmin'];

// -------------------------------------------------------------------
// DEFINICIÓN DE RUTAS CRUD PARA USUARIOS
// -------------------------------------------------------------------

// GET /api/usuarios -> Listar todos los usuarios
router.get("/", [verifyToken, authorizeRoles(SUPER_ADMIN_ONLY)], listAllUsers);

// POST /api/usuarios -> Crear un nuevo usuario
router.post("/", [verifyToken, authorizeRoles(SUPER_ADMIN_ONLY)], createUser);

// GET /api/usuarios/:id -> Obtener un usuario por ID
router.get("/:id", [verifyToken, authorizeRoles(SUPER_ADMIN_ONLY)], getUsuarioById);

// PUT /api/usuarios/:id -> Actualizar un usuario por ID
router.put("/:id", [verifyToken, authorizeRoles(SUPER_ADMIN_ONLY)], updateUsuario);

// DELETE /api/usuarios/:id -> Eliminar un usuario por ID
router.delete("/:id", [verifyToken, authorizeRoles(SUPER_ADMIN_ONLY)], deleteUsuario);

export default router;
