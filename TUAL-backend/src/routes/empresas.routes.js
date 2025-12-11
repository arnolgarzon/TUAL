import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getEmpresas, createEmpresa } from "../controllers/empresas.controller.js";

const router = express.Router();

router.get("/", verifyToken, getEmpresas);
router.post("/", verifyToken, createEmpresa);

export default router;