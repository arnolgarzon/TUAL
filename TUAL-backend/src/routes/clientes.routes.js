import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/authorizePermissions.js";
import requireModule from "../middleware/requireModule.js";
import { crearCliente, listarClientes } from "../controllers/clientes.controller.js";

const router = Router();

router.use(authMiddleware);
router.use(requireModule("clientes"));

router.get("/", authorizePermissions(["clientes.ver"]), listarClientes);
router.post("/", authorizePermissions(["clientes.crear"]), crearCliente);

export default router;