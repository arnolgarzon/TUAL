import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from "../controllers/empresas.controller.js";

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles("superadmin"));

router.get("/", getEmpresas);
router.post("/", createEmpresa);
router.get("/:id", getEmpresaById);
router.put("/:id", updateEmpresa);
router.delete("/:id", deleteEmpresa);

export default router;