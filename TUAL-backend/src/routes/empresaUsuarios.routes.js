// src/routes/empresaUsuarios.routes.js
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/authorizePermissions.js";
import requireModule from "../middleware/requireModule.js";

import {
  listarUsuariosEmpresa,
  crearEmpleado,
  actualizarRolUsuario,
  activarDesactivarUsuario,
} from "../controllers/empresaUsuarios.controller.js";

const router = Router();

// Todo este módulo requiere login
router.use(authMiddleware);

// (Opcional pero recomendado) Bloquea el acceso si el módulo "usuarios" no está habilitado
// Si aún no manejas módulos, comenta la siguiente línea.
router.use(requireModule("usuarios"));

const validateIdParam = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El parámetro id debe ser un número entero positivo",
      code: "INVALID_ID",
    });
  }
  req.params.id = String(id);
  return next();
};

// Listar usuarios internos
router.get("/", authorizePermissions(["usuarios.ver"]), listarUsuariosEmpresa);

// Crear empleado (usuario interno)
router.post("/", authorizePermissions(["usuarios.crear"]), crearEmpleado);

// Cambiar rol de un usuario interno
router.patch(
  "/:id/rol",
  validateIdParam,
  authorizePermissions(["usuarios.editar"]),
  actualizarRolUsuario
);

// Activar/desactivar usuario interno
router.patch(
  "/:id/activo",
  validateIdParam,
  authorizePermissions(["usuarios.desactivar"]),
  activarDesactivarUsuario
);

export default router;