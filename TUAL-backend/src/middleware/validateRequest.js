// src/middleware/validateRequest.js
import { validationResult } from "express-validator";

/**
 * Middleware para validar requests con express-validator
 * Debe ejecutarse DESPUÉS de las reglas body(), param(), query(), etc.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      message: "Errores de validación",
      errors: errors.array().map(err => ({
        field: err.path,
        value: err.value,
        message: err.msg,
      })),
    });
  }

  next();
};

export default validateRequest;
