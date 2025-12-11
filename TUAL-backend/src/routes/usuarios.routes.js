// src/routes/usuarios.routes.js

import express from "express";
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

// Roles permitidos para la mayoría de las operaciones de administración de usuarios
// 🛑 NOTA: El rol 'super_usuario' DEBE coincidir con el valor de la base de datos
const ADMIN_ROLES = ['Superadmin']; // <- Usamos 'Superadmin' como hemos acordado en otros archivos

// -------------------------------------------------------------------
// 1. LISTAR TODOS LOS USUARIOS (READ ALL)
// -------------------------------------------------------------------
router.get(
    "/",
    verifyToken,
    authorizeRoles(ADMIN_ROLES),
    listAllUsers
);

// -------------------------------------------------------------------
// 2. CREAR NUEVO USUARIO (CREATE)
// -------------------------------------------------------------------
router.post(
    "/",
    verifyToken,
    authorizeRoles(ADMIN_ROLES),
    createUser
);

// -------------------------------------------------------------------
// 3. OBTENER DETALLE (READ ONE)
// -------------------------------------------------------------------
router.get(
    "/:id",
    verifyToken,
    authorizeRoles(ADMIN_ROLES),
    getUsuarioById // 🛑 CORREGIDO: Antes era 'getUserById'
);

// -------------------------------------------------------------------
// 3. ACTUALIZAR USUARIO (UPDATE)
// -------------------------------------------------------------------
router.put(
    "/:id",
    verifyToken,
    authorizeRoles(ADMIN_ROLES),
    updateUsuario // 🛑 CORREGIDO: Antes era 'updateUser'
);

// -------------------------------------------------------------------
// 4. ELIMINAR USUARIO (DELETE)
// -------------------------------------------------------------------
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles(ADMIN_ROLES),
    deleteUsuario // 🛑 CORREGIDO: Antes era 'deleteUser'
);


export default router;