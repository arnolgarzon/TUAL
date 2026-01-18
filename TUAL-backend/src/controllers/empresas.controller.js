import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

// ===============================
// LISTAR EMPRESAS
// ===============================
export const getEmpresas = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM empresas");
    res.status(200).json({
      message: "Lista de empresas obtenida exitosamente",
      empresas: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener empresas" });
  }
};

// ===============================
// OBTENER EMPRESA POR ID
// ===============================
export const getEmpresaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM empresas WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    res.status(200).json({
      message: "Empresa obtenida exitosamente",
      empresa: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener empresa" });
  }
};

// ===============================
// REGISTRO COMPLETO EMPRESA + ADMIN
// ===============================
export const createEmpresa = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      nombre,
      nit,
      email,
      password,
      telefono,
      direccion,
    } = req.body;

    // 🔐 Validación estricta
    if (!nombre || !nit || !email || !password) {
      return res.status(400).json({
        message: "Nombre, NIT, email y contraseña son obligatorios",
      });
    }

    await client.query("BEGIN");

    // 🔎 Verificar email existente
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

    // 🏢 Crear empresa
    const empresaResult = await client.query(
      `
      INSERT INTO empresas (nombre, nit, email, telefono, direccion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [nombre, nit, email, telefono || null, direccion || null]
    );

    const empresaId = empresaResult.rows[0].id;

    // 🔑 Crear usuario ADMIN
    const passwordHash = await bcrypt.hash(password, 10);

    await client.query(
      `
      INSERT INTO usuarios (email, password, rol, empresa_id)
      VALUES ($1, $2, $3, $4)
      `,
      [email, passwordHash, "ADMIN", empresaId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Empresa y administrador creados exitosamente",
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error en registro empresa:", error);
    res.status(500).json({
      message: "Error interno al registrar la empresa",
    });
  } finally {
    client.release();
  }
};

// ===============================
// ACTUALIZAR EMPRESA
// ===============================
export const updateEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, nit, direccion, telefono } = req.body;

    const result = await pool.query(
      `
      UPDATE empresas
      SET nombre=$1, nit=$2, direccion=$3, telefono=$4
      WHERE id=$5
      RETURNING *
      `,
      [nombre, nit, direccion, telefono, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    res.status(200).json({
      message: "Empresa actualizada exitosamente",
      empresa: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar empresa" });
  }
};

// ===============================
// ELIMINAR EMPRESA
// ===============================
export const deleteEmpresa = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM empresas WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    res.status(200).json({
      message: "Empresa eliminada exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar empresa" });
  }
};
