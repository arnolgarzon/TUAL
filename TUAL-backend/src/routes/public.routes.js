import express from "express";
import { registroEmpresa } from "../controllers/public.controller.js";

const router = express.Router();

router.post("/registro-empresa", registroEmpresa);

export default router;
