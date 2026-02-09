// src/routes/auth.routes.js
import { Router } from "express";
import { body, param } from "express-validator";

import authMiddleware from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

import {
  login,
  register,
  verifyEmailCode,
  resendVerificationCode,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

/**
 * ====================================================
 * AUTH ROUTES - TUAL
 * ----------------------------------------------------
 * - NO usar requireModule aquí
 * - Auth es público salvo cambio de contraseña
 * - Todas las validaciones cierran con validateRequest
 * ====================================================
 */

/* ====================================================
   1) REGISTRO DE USUARIO
==================================================== */
router.post(
  "/register",
  [
    body("nombre")
      .trim()
      .notEmpty().withMessage("El nombre es obligatorio.")
      .isLength({ min: 2, max: 80 })
      .withMessage("El nombre debe tener entre 2 y 80 caracteres."),

    body("email")
      .isEmail().withMessage("Debe ser un correo electrónico válido.")
      .normalizeEmail()
      .isLength({ max: 120 })
      .withMessage("El email es demasiado largo."),

    body("password")
      .isString().withMessage("La contraseña debe ser texto.")
      .isLength({ min: 8, max: 128 })
      .withMessage("La contraseña debe tener entre 8 y 128 caracteres.")
      .matches(/\d/)
      .withMessage("La contraseña debe contener al menos un número."),
  ],
  validateRequest,
  register
);

/* ====================================================
   2) LOGIN
==================================================== */
router.post(
  "/login",
  [
    body("email")
      .isEmail().withMessage("Correo electrónico inválido.")
      .normalizeEmail()
      .isLength({ max: 120 })
      .withMessage("El email es demasiado largo."),

    body("password")
      .notEmpty().withMessage("La contraseña es obligatoria.")
      .isString().withMessage("La contraseña debe ser texto.")
      .isLength({ max: 128 })
      .withMessage("La contraseña es demasiado larga."),
  ],
  validateRequest,
  login
);

/* ====================================================
   3) VERIFICAR CORREO (CÓDIGO 6 DÍGITOS)
==================================================== */
router.post(
  "/verify-email",
  [
    body("email")
      .isEmail().withMessage("Correo electrónico inválido.")
      .normalizeEmail()
      .isLength({ max: 120 })
      .withMessage("El email es demasiado largo."),

    body("code")
      .trim()
      .matches(/^\d{6}$/)
      .withMessage("El código debe tener 6 dígitos."),
  ],
  validateRequest,
  verifyEmailCode
);

/* ====================================================
   4) REENVIAR CÓDIGO DE VERIFICACIÓN
==================================================== */
router.post(
  "/resend-verification",
  [
    body("email")
      .isEmail().withMessage("Correo electrónico inválido.")
      .normalizeEmail()
      .isLength({ max: 120 })
      .withMessage("El email es demasiado largo."),
  ],
  validateRequest,
  resendVerificationCode
);

/* ====================================================
   5) CAMBIAR CONTRASEÑA (USUARIO AUTENTICADO)
==================================================== */
router.post(
  "/change-password",
  authMiddleware,
  [
    body("currentPassword")
      .notEmpty().withMessage("La contraseña actual es obligatoria.")
      .isString().withMessage("La contraseña actual debe ser texto.")
      .isLength({ max: 128 })
      .withMessage("La contraseña actual es demasiado larga."),

    body("newPassword")
      .notEmpty().withMessage("La nueva contraseña es obligatoria.")
      .isString().withMessage("La nueva contraseña debe ser texto.")
      .isLength({ min: 8, max: 128 })
      .withMessage("Debe tener entre 8 y 128 caracteres.")
      .matches(/\d/)
      .withMessage("Debe contener al menos un número.")
      .custom((value, { req }) => value !== req.body.currentPassword)
      .withMessage("La nueva contraseña no puede ser igual a la actual."),
  ],
  validateRequest,
  changePassword
);

/* ====================================================
   6) OLVIDÉ MI CONTRASEÑA (PASO 1)
==================================================== */
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail().withMessage("Correo electrónico inválido.")
      .normalizeEmail()
      .isLength({ max: 120 })
      .withMessage("El email es demasiado largo."),
  ],
  validateRequest,
  forgotPassword
);

/* ====================================================
   7) RESET DE CONTRASEÑA (PASO 2)
==================================================== */
router.post(
  "/reset-password/:token",
  [
    param("token")
      .notEmpty()
      .withMessage("Token de recuperación requerido."),

    body("newPassword")
      .notEmpty().withMessage("La nueva contraseña es obligatoria.")
      .isString().withMessage("La contraseña debe ser texto.")
      .isLength({ min: 8, max: 128 })
      .withMessage("Debe tener entre 8 y 128 caracteres.")
      .matches(/\d/)
      .withMessage("Debe contener al menos un número."),
  ],
  validateRequest,
  resetPassword
);

export default router;
