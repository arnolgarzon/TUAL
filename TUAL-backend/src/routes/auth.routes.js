// src/routes/auth.routes.js

import { Router } from "express";
import { body } from "express-validator"; // 🛑 NUEVO: Importamos el validador
import { login, register } from "../controllers/auth.controller.js"; // 🛑 MEJORA: Importamos la función register

const router = Router();

// ----------------------------------------------------
// 1. REGISTRO (SOLUCIÓN A TU ERROR DE CONEXIÓN)
// ----------------------------------------------------
router.post(
    "/register",
    [
        // 🛑 VALIDACIÓN DE ROBUSTEZ: Aseguramos que los datos sean correctos antes de ir al controlador
        body('nombre')
            .trim()
            .notEmpty().withMessage('El nombre del negocio es obligatorio.'),
        body('email')
            .isEmail().withMessage('Debe ser un correo electrónico válido.')
            .normalizeEmail(), // Normaliza el email (ej: a minúsculas)
        body('password')
            .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
            .matches(/\d/).withMessage('La contraseña debe contener al menos un número.') // Añadimos requisito de número
    ],
    register // Función de controlador para manejar la lógica de registro
);


// ----------------------------------------------------
// 2. INICIO DE SESIÓN
// ----------------------------------------------------
router.post(
    "/login",
    [
        // Validación básica para el login
        body('email').isEmail().withMessage('Correo electrónico inválido.'),
        body('password').notEmpty().withMessage('La contraseña es obligatoria.')
    ],
    login
);

// ----------------------------------------------------
// 3. OTRAS RUTAS (Futuro)
// ----------------------------------------------------

// router.post("/forgot-password", forgotPassword);
// router.get("/me", verifyToken, getProfile); // Ruta para rehidratar la sesión


export default router;