import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from "../controllers/empresas.controller.js";

const router = Router();

// Protección global del módulo superadmin
router.use(authMiddleware);
router.use(authorizeRoles("superadmin"));

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

// CRUD Empresas (solo superadmin)
router.get("/", getEmpresas);
router.post("/", createEmpresa);

router.get("/:id", validateIdParam, getEmpresaById);
router.put("/:id", validateIdParam, updateEmpresa);
router.delete("/:id", validateIdParam, deleteEmpresa);

export default router;