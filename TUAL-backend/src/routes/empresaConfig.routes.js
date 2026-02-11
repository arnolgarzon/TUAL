import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

/* =====================================
   OBTENER CONFIGURACIÓN DE EMPRESA
===================================== */
router.get("/config/:empresaId", async (req, res) => {
  try {
    const { empresaId } = req.params;

    const empresaResult = await pool.query(
      "SELECT id, nombre, nit, email, telefono, direccion FROM empresas WHERE id = $1",
      [empresaId]
    );

    if (empresaResult.rows.length === 0) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    const modulosResult = await pool.query(
      "SELECT modulo, enabled FROM empresa_modulos WHERE empresa_id = $1",
      [empresaId]
    );

    res.json({
      empresa: empresaResult.rows[0],
      modulos: modulosResult.rows,
    });
  } catch (error) {
    console.error("Error obteniendo config empresa:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

/* =====================================
   ACTUALIZAR DATOS EMPRESA
===================================== */
router.put("/config/:empresaId", async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { nombre, nit, telefono, direccion } = req.body;

    const result = await pool.query(
      `
      UPDATE empresas
      SET nombre = $1,
          nit = $2,
          telefono = $3,
          direccion = $4
      WHERE id = $5
      RETURNING *
      `,
      [nombre, nit, telefono, direccion, empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    res.json({
      message: "Configuración actualizada correctamente",
      empresa: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando empresa:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

/* =====================================
   ACTIVAR / DESACTIVAR MÓDULO
===================================== */
router.patch("/config/:empresaId/modulo", async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { modulo, enabled } = req.body;

    if (!modulo) {
      return res.status(400).json({
        message: "El nombre del módulo es obligatorio",
      });
    }

    await pool.query(
      `
      INSERT INTO empresa_modulos (empresa_id, modulo, enabled)
      VALUES ($1, $2, $3)
      ON CONFLICT (empresa_id, modulo)
      DO UPDATE SET enabled = $3
      `,
      [empresaId, modulo, enabled]
    );

    res.json({
      message: "Módulo actualizado correctamente",
    });
  } catch (error) {
    console.error("Error actualizando módulo:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

export default router;
