import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

import {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresaPerfil,
  deleteEmpresa,
  getEmpresaConfig,
  toggleModulo,
} from "../controllers/empresas.controller.js";

const router = Router();

/* ======================================================
   RUTAS SUPERADMIN
====================================================== */
router.use(authMiddleware);

router.get(
  "/",
  authorizeRoles("superadmin"),
  getEmpresas
);

router.post(
  "/",
  authorizeRoles("superadmin"),
  createEmpresa
);

router.get(
  "/:id",
  authorizeRoles("superadmin"),
  getEmpresaById
);

router.delete(
  "/:id",
  authorizeRoles("superadmin"),
  deleteEmpresa
);

/* ======================================================
   CONFIGURACIÓN EMPRESA (ADMIN_EMPRESA)
====================================================== */

router.get(
  "/config",
  authorizeRoles("admin_empresa"),
  getEmpresaConfig
);

router.put(
  "/config/perfil",
  authorizeRoles("admin_empresa"),
  updateEmpresaPerfil
);

router.patch(
  "/config/modulo",
  authorizeRoles("admin_empresa"),
  toggleModulo
);

export default router;
