import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

/* ======================================================
   LISTAR EMPRESAS (solo superadmin debería usar esto)
====================================================== */
export const getEmpresas = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre, nit, email, telefono, direccion, created_at FROM empresas ORDER BY id DESC"
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al listar empresas:", error);
    res.status(500).json({ message: "Error al obtener empresas" });
  }
};

/* ======================================================
   OBTENER EMPRESA POR ID
====================================================== */
export const getEmpresaById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT id, nombre, nit, email, telefono, direccion FROM empresas WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error obteniendo empresa:", error);
    res.status(500).json({ message: "Error al obtener empresa" });
  }
};

/* ======================================================
   REGISTRO COMPLETO EMPRESA + ADMIN + MÓDULOS INICIALES
====================================================== */
export const createEmpresa = async (req, res) => {
  const client = await pool.connect();

  try {
    const { nombre, nit, email, password, telefono, direccion } = req.body;

    if (!nombre || !nit || !email || !password) {
      return res.status(400).json({
        message: "Nombre, NIT, email y contraseña son obligatorios",
      });
    }

    await client.query("BEGIN");

    // Verificar email duplicado
    const emailCheck = await client.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (emailCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "Ya existe un usuario con este email",
      });
    }

    // Crear empresa
    const empresaResult = await client.query(
      `
      INSERT INTO empresas (nombre, nit, email, telefono, direccion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [nombre, nit, email, telefono || null, direccion || null]
    );

    const empresaId = empresaResult.rows[0].id;

    // Crear usuario ADMIN_EMPRESA
    const passwordHash = await bcrypt.hash(password, 10);

    await client.query(
      `
      INSERT INTO usuarios (email, password, rol, empresa_id)
      VALUES ($1, $2, $3, $4)
      `,
      [email, passwordHash, "admin_empresa", empresaId]
    );

    /* ===============================
       CREAR MÓDULOS INICIALES
    ================================ */

    const modulosIniciales = [
      "dashboard",
      "clientes",
      "usuarios_internos",
      "ordenes_trabajo",
      "vehiculos"
    ];

    for (const modulo of modulosIniciales) {
      await client.query(
        `
        INSERT INTO empresa_modulos (empresa_id, modulo, enabled)
        VALUES ($1, $2, true)
        `,
        [empresaId, modulo]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Empresa, administrador y módulos creados correctamente",
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en registro empresa:", error);
    res.status(500).json({
      message: "Error interno al registrar la empresa",
    });
  } finally {
    client.release();
  }
};

/* ======================================================
   ACTUALIZAR DATOS DE EMPRESA
====================================================== */
export const updateEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, nit, direccion, telefono } = req.body;

    const result = await pool.query(
      `
      UPDATE empresas
      SET nombre = $1,
          nit = $2,
          direccion = $3,
          telefono = $4
      WHERE id = $5
      RETURNING id, nombre, nit, direccion, telefono
      `,
      [nombre, nit, direccion, telefono, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    res.status(200).json({
      message: "Empresa actualizada correctamente",
      empresa: result.rows[0],
    });

  } catch (error) {
    console.error("Error actualizando empresa:", error);
    res.status(500).json({ message: "Error al actualizar empresa" });
  }
};

/* ======================================================
   ELIMINAR EMPRESA
====================================================== */
export const deleteEmpresa = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM empresas WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    res.status(200).json({
      message: "Empresa eliminada correctamente",
    });

  } catch (error) {
    console.error("Error eliminando empresa:", error);
    res.status(500).json({ message: "Error al eliminar empresa" });
  }
};

/* ======================================================
   OBTENER MÓDULOS DE EMPRESA (CONFIGURACIÓN)
====================================================== */
export const getEmpresaModulos = async (req, res) => {
  try {
    const empresaId = req.usuario.empresa_id;

    const result = await pool.query(
      `
      SELECT modulo, enabled
      FROM empresa_modulos
      WHERE empresa_id = $1
      ORDER BY modulo
      `,
      [empresaId]
    );

    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Error obteniendo módulos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ======================================================
   ACTUALIZAR MÓDULOS DE EMPRESA
====================================================== */
export const updateEmpresaModulos = async (req, res) => {
  const client = await pool.connect();

  try {
    const empresaId = req.usuario.empresa_id;
    const { modulos } = req.body;

    if (!Array.isArray(modulos)) {
      return res.status(400).json({ message: "Formato inválido" });
    }

    await client.query("BEGIN");

    for (const m of modulos) {
      await client.query(
        `
        UPDATE empresa_modulos
        SET enabled = $1
        WHERE empresa_id = $2 AND modulo = $3
        `,
        [m.enabled, empresaId, m.modulo]
      );
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: "Módulos actualizados correctamente",
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error actualizando módulos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  } finally {
    client.release();
  }
};
