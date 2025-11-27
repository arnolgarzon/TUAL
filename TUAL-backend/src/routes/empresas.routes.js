import express from "express";
import { verificarToken } from "../middleware/authMiddleware.js";
import { getEmpresas, createEmpresa } from "../controllers/empresas.controller.js";

const router = express.Router();

router.get("/", verificarToken, getEmpresas);
router.post("/", verificarToken, createEmpresa);

export default router;