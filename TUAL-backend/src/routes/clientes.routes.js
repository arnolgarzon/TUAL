// src/routes/clientes.routes.js
import { Router } from "express";
import ClientesController from "../controllers/clientes.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, ClientesController.crearCliente);
router.get("/", authMiddleware, ClientesController.listarClientes);

export default router;