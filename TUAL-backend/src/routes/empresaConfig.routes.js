import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { pool } from "../config/db.js";

const router = express.Router();

/* ======================================================
   MIDDLEWARE GLOBAL
====================================================== */
router.use(authMiddleware);
router.use(authorizeRoles("admin_empresa"));

/* ======================================================
   HELPER: VALIDAR EMPRESA
====================================================== */
const getEmpresaId = (req) => {
  if (!req.user || !req.user.empresaId) {
    throw new Error("Usuario sin empresa asociada");
  }
  return req.user.empresaId;
};

/* ======================================================
   GET /api/empresa/config
====================================================== */
router.get("/", async (req, res) => {
  try {
    const empresaId = getEmpresaId(req);

    const empresaResult = await pool.query(
      `SELECT id, nombre, nit, email, telefono, direccion
       FROM empresas
       WHERE id = $1`,
      [empresaId]
    );

    if (!empresaResult.rows.length) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    const modulosResult = await pool.query(
      `SELECT modulo, enabled
       FROM empresa_modulos
       WHERE empresa_id = $1
       ORDER BY modulo`,
      [empresaId]
    );

    res.json({
      empresa: empresaResult.rows[0],
      modulos: modulosResult.rows,
    });

  } catch (error) {
    console.error("Error obteniendo config empresa:", error.message);
    res.status(500).json({ message: error.message });
  }
});

/* ======================================================
   PUT /api/empresa/config/perfil
====================================================== */
router.put("/perfil", async (req, res) => {
  try {
    const empresaId = getEmpresaId(req);
    const { nombre, nit, telefono, direccion, email } = req.body;

    const result = await pool.query(
      `UPDATE empresas
       SET nombre = $1,
           nit = $2,
           telefono = $3,
           direccion = $4,
           email = $5
       WHERE id = $6
       RETURNING id, nombre, nit, telefono, direccion, email`,
      [nombre, nit, telefono, direccion, email, empresaId]
    );

    res.json({
      message: "Configuración actualizada correctamente",
      empresa: result.rows[0],
    });

  } catch (error) {
    console.error("Error actualizando empresa:", error.message);
    res.status(500).json({ message: error.message });
  }
});

/* ======================================================
   PATCH /api/empresa/config/modulo
====================================================== */
router.patch("/modulo", async (req, res) => {
  try {
    const empresaId = getEmpresaId(req);
    const { modulo, enabled } = req.body;

    if (!modulo || typeof enabled !== "boolean") {
      return res.status(400).json({ message: "Datos inválidos" });
    }

    await pool.query(
      `INSERT INTO empresa_modulos (empresa_id, modulo, enabled)
       VALUES ($1, $2, $3)
       ON CONFLICT (empresa_id, modulo)
       DO UPDATE SET enabled = EXCLUDED.enabled`,
      [empresaId, modulo, enabled]
    );

    res.json({ message: "Módulo actualizado correctamente" });

  } catch (error) {
    console.error("Error actualizando módulo:", error.message);
    res.status(500).json({ message: error.message });
  }
});

/* ======================================================
   GET /api/empresa/config/stats
====================================================== */
router.get("/stats", async (req, res) => {
  try {
    const empresaId = getEmpresaId(req);

    const clientes = await pool.query(
      "SELECT COUNT(*) FROM clientes WHERE empresa_id = $1",
      [empresaId]
    );

    const usuarios = await pool.query(
      "SELECT COUNT(*) FROM usuarios WHERE empresa_id = $1",
      [empresaId]
    );

    const ordenes = await pool.query(
      "SELECT COUNT(*) FROM ordenes_trabajo WHERE empresa_id = $1",
      [empresaId]
    );

    const pagos = await pool.query(
  `
  SELECT COALESCE(SUM(p.monto), 0) AS total
  FROM pagos p
  INNER JOIN ordenes_trabajo o ON p.orden_id = o.id
  WHERE o.empresa_id = $1
  `,
  [empresaId]
);


    res.json({
      totalClientes: Number(clientes.rows[0].count),
      totalUsuarios: Number(usuarios.rows[0].count),
      totalOrdenes: Number(ordenes.rows[0].count),
      totalFacturacion: Number(pagos.rows[0].total),
    });

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error.message);
    res.status(500).json({ message: error.message });
  }
});


export default router;
