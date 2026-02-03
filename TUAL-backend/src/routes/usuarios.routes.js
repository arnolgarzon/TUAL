// src/routes/usuarios.routes.js
import express from "express";
import {
  listAllUsers,
  getUsuarioById,
  createUser,
  updateUsuario,
  deleteUsuario,
} from "../controllers/usuarios.controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

const SUPER_ADMIN_ONLY = ["superadmin"];

router.get("/", [authMiddleware, authorizeRoles(SUPER_ADMIN_ONLY)], listAllUsers);
router.post("/", [authMiddleware, authorizeRoles(SUPER_ADMIN_ONLY)], createUser);
router.get("/:id", [authMiddleware, authorizeRoles(SUPER_ADMIN_ONLY)], getUsuarioById);
router.put("/:id", [authMiddleware, authorizeRoles(SUPER_ADMIN_ONLY)], updateUsuario);
router.delete("/:id", [authMiddleware, authorizeRoles(SUPER_ADMIN_ONLY)], deleteUsuario);

export default router;