import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

/* ======================================================
   LISTAR EMPRESAS (SOLO SUPERADMIN)
====================================================== */
export const getEmpresas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, nit, email, telefono, direccion, created_at
      FROM empresas
      ORDER BY id DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error listando empresas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ======================================================
   OBTENER EMPRESA POR ID (SUPERADMIN)
====================================================== */
export const getEmpresaById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, nombre, nit, email, telefono, direccion, created_at
       FROM empresas
       WHERE id = $1`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error obteniendo empresa:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ======================================================
   CREAR EMPRESA + ADMIN + MÓDULOS BASE
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

    // Validar email duplicado
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
      `INSERT INTO empresas (nombre, nit, email, telefono, direccion)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [nombre, nit, email, telefono || null, direccion || null]
    );

    const empresaId = empresaResult.rows[0].id;

    // Crear usuario admin_empresa
    const passwordHash = await bcrypt.hash(password, 10);

    await client.query(
      `INSERT INTO usuarios (email, password, rol, empresa_id)
       VALUES ($1, $2, 'admin_empresa', $3)`,
      [email, passwordHash, empresaId]
    );

    // Módulos base
    const modulosIniciales = [
      "clientes",
      "usuarios",
      "inventario",
      "finanzas",
      "reportes",
      "facturacion",
      "ordenes"
    ];

    for (const modulo of modulosIniciales) {
      await client.query(
        `INSERT INTO empresa_modulos (empresa_id, modulo, enabled)
         VALUES ($1, $2, true)`,
        [empresaId, modulo]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Empresa creada correctamente",
      empresaId,
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creando empresa:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  } finally {
    client.release();
  }
};

/* ======================================================
   ACTUALIZAR PERFIL EMPRESA (ADMIN_EMPRESA)
====================================================== */
export const updateEmpresaPerfil = async (req, res) => {
  try {
    const empresaId = req.usuario.empresa_id;
    const { nombre, nit, direccion, telefono, email } = req.body;

    const result = await pool.query(
      `UPDATE empresas
       SET nombre = $1,
           nit = $2,
           direccion = $3,
           telefono = $4,
           email = $5
       WHERE id = $6
       RETURNING id, nombre, nit, direccion, telefono, email`,
      [nombre, nit, direccion, telefono, email, empresaId]
    );

    res.status(200).json({
      message: "Perfil actualizado correctamente",
      empresa: result.rows[0],
    });

  } catch (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ======================================================
   OBTENER CONFIGURACIÓN COMPLETA
====================================================== */
export const getEmpresaConfig = async (req, res) => {
  try {
    const empresaId = req.usuario.empresa_id;

    const empresa = await pool.query(
      `SELECT id, nombre, nit, email, telefono, direccion
       FROM empresas
       WHERE id = $1`,
      [empresaId]
    );

    const modulos = await pool.query(
      `SELECT modulo, enabled
       FROM empresa_modulos
       WHERE empresa_id = $1
       ORDER BY modulo`,
      [empresaId]
    );

    res.status(200).json({
      empresa: empresa.rows[0],
      modulos: modulos.rows,
    });

  } catch (error) {
    console.error("Error obteniendo configuración:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ======================================================
   TOGGLE INDIVIDUAL DE MÓDULO (UPSERT SEGURO)
====================================================== */
export const toggleModulo = async (req, res) => {
  try {
    const empresaId = req.usuario.empresa_id;
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

    res.status(200).json({
      message: "Módulo actualizado correctamente",
    });

  } catch (error) {
    console.error("Error actualizando módulo:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ======================================================
   ESTADÍSTICAS EMPRESA (DASHBOARD)
====================================================== */
export const getEmpresaStats = async (req, res) => {
  try {
    const empresaId = req.usuario.empresa_id;

    const clientes = await pool.query(
      "SELECT COUNT(*) FROM clientes WHERE empresa_id = $1",
      [empresaId]
    );

    const usuarios = await pool.query(
      "SELECT COUNT(*) FROM usuarios WHERE empresa_id = $1",
      [empresaId]
    );

    const ordenes = await pool.query(
      "SELECT COUNT(*) FROM ordenes WHERE empresa_id = $1",
      [empresaId]
    );

    const facturacion = await pool.query(
      "SELECT COALESCE(SUM(total),0) AS total FROM facturas WHERE empresa_id = $1",
      [empresaId]
    );

    res.status(200).json({
      totalClientes: Number(clientes.rows[0].count),
      totalUsuarios: Number(usuarios.rows[0].count),
      totalOrdenes: Number(ordenes.rows[0].count),
      totalFacturacion: Number(facturacion.rows[0].total),
    });

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/* ======================================================
   ELIMINAR EMPRESA (SUPERADMIN)
====================================================== */
export const deleteEmpresa = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM empresas WHERE id = $1 RETURNING id",
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    res.status(200).json({
      message: "Empresa eliminada correctamente",
    });

  } catch (error) {
    console.error("Error eliminando empresa:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
