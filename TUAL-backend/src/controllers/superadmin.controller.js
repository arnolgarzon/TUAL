// src/controllers/superadmin.controller.js
import { pool } from "../config/db.js";

const isValidIntId = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

/* =========================================================================
   📊 Dashboard principal del sistema (SUPERADMIN) - Métricas globales reales
======================================================================== */
export const getSystemStats = async (req, res) => {
  try {
    const [
      empresasTotal,
      empresasActivas,
      empresasInactivas,
      clientesTotal,
      usuariosTotal,
      usuariosActivos,
      usuariosInactivos,
      usuariosPorRol,
      topEmpresasPorClientes,
      ultimosUsuarios,
      ultimasEmpresas,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS total FROM empresas"),
      pool.query("SELECT COUNT(*)::int AS total FROM empresas WHERE activo = true"),
      pool.query("SELECT COUNT(*)::int AS total FROM empresas WHERE activo = false"),

      pool.query("SELECT COUNT(*)::int AS total FROM clientes"),

      pool.query("SELECT COUNT(*)::int AS total FROM usuarios"),
      pool.query("SELECT COUNT(*)::int AS total FROM usuarios WHERE activo = true"),
      pool.query("SELECT COUNT(*)::int AS total FROM usuarios WHERE activo = false"),

      pool.query(`
        SELECT rol, COUNT(*)::int AS total
        FROM usuarios
        GROUP BY rol
        ORDER BY total DESC
      `),

      pool.query(`
        SELECT 
          e.id,
          e.nombre,
          COUNT(c.id)::int AS total_clientes
        FROM empresas e
        LEFT JOIN clientes c ON c.empresa_id = e.id
        GROUP BY e.id
        ORDER BY total_clientes DESC
        LIMIT 5
      `),

      pool.query(`
        SELECT 
          u.id, u.nombre, u.email, u.rol, u.activo, u.fecha_registro,
          e.nombre AS empresa_nombre
        FROM usuarios u
        LEFT JOIN empresas e ON e.id = u.empresa_id
        ORDER BY u.fecha_registro DESC
        LIMIT 5
      `),

      pool.query(`
        SELECT id, nombre, activo, fecha_registro
        FROM empresas
        ORDER BY fecha_registro DESC
        LIMIT 5
      `),
    ]);

    return res.status(200).json({
      sistema: "TUAL",
      stats: {
        empresas: {
          total: empresasTotal.rows[0].total,
          activas: empresasActivas.rows[0].total,
          inactivas: empresasInactivas.rows[0].total,
        },
        clientes: {
          total: clientesTotal.rows[0].total,
        },
        usuarios: {
          total: usuariosTotal.rows[0].total,
          activos: usuariosActivos.rows[0].total,
          inactivos: usuariosInactivos.rows[0].total,
          porRol: usuariosPorRol.rows,
        },
        topEmpresasPorClientes: topEmpresasPorClientes.rows,
        recientes: {
          usuarios: ultimosUsuarios.rows,
          empresas: ultimasEmpresas.rows,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("❌ Error getSystemStats:", error);
    return res.status(500).json({
      message: "Error obteniendo estadísticas del sistema",
    });
  }
};

/* =========================================================================
   🏢 Listar empresas (visión global superadmin)
   - Incluye conteo de clientes por empresa
======================================================================== */
export const listEmpresas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id,
        e.nombre,
        e.nit,
        e.telefono,
        e.email,
        e.sector,
        e.fecha_registro,
        e.admin_id,
        e.activo,
        COUNT(c.id)::int AS total_clientes
      FROM empresas e
      LEFT JOIN clientes c ON c.empresa_id = e.id
      GROUP BY e.id
      ORDER BY e.fecha_registro DESC
    `);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error listEmpresas:", error);
    return res.status(500).json({ message: "Error listando empresas" });
  }
};

/* =========================================================================
   🏢 Detalle de empresa + métricas básicas
======================================================================== */
export const getEmpresaDetail = async (req, res) => {
  const { id } = req.params;

  if (!isValidIntId(id)) {
    return res.status(400).json({ message: "ID de empresa inválido" });
  }

  try {
    const [empresa, clientesCount, usuariosCount] = await Promise.all([
      pool.query(
        `
        SELECT id, nombre, nit, telefono, direccion, email, sector, fecha_registro, admin_id, activo
        FROM empresas
        WHERE id = $1
        `,
        [Number(id)]
      ),
      pool.query("SELECT COUNT(*)::int AS total FROM clientes WHERE empresa_id = $1", [
        Number(id),
      ]),
      pool.query("SELECT COUNT(*)::int AS total FROM usuarios WHERE empresa_id = $1", [
        Number(id),
      ]),
    ]);

    if (empresa.rows.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    return res.status(200).json({
      empresa: empresa.rows[0],
      metrics: {
        clientes: clientesCount.rows[0].total,
        usuarios: usuariosCount.rows[0].total,
      },
    });
  } catch (error) {
    console.error("❌ Error getEmpresaDetail:", error);
    return res.status(500).json({ message: "Error obteniendo detalle de empresa" });
  }
};

/* =========================================================================
   🔁 Activar / Suspender empresa
   Body: { activo: true|false }
======================================================================== */
export const toggleEmpresa = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  if (!isValidIntId(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  if (typeof activo !== "boolean") {
    return res.status(400).json({ message: "El campo 'activo' debe ser boolean" });
  }

  try {
    const result = await pool.query(
      `
      UPDATE empresas
      SET activo = $1
      WHERE id = $2
      RETURNING id, nombre, activo
      `,
      [activo, Number(id)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    return res.status(200).json({
      message: "Estado de empresa actualizado",
      empresa: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error toggleEmpresa:", error);
    return res.status(500).json({ message: "Error actualizando estado de empresa" });
  }
};

/* =========================================================================
   👥 Usuarios de autenticación (tabla usuarios)
   - Para el panel superadmin "Usuarios (Global)"
======================================================================== */
export const listUsuariosAuth = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.nombre,
        u.email,
        u.rol,
        u.activo,
        u.fecha_registro,
        u.empresa_id,
        e.nombre AS empresa_nombre
      FROM usuarios u
      LEFT JOIN empresas e ON e.id = u.empresa_id
      ORDER BY u.fecha_registro DESC
    `);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error listUsuariosAuth:", error);
    return res.status(500).json({ message: "Error listando usuarios del sistema" });
  }
};

/* =========================================================================
   🔁 Activar / Desactivar usuario (tabla usuarios)
   Body: { activo: true|false }
   - Evita que el superadmin se desactive a sí mismo
======================================================================== */
export const toggleUsuarioAuth = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  if (!isValidIntId(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  if (typeof activo !== "boolean") {
    return res.status(400).json({ message: "El campo 'activo' debe ser boolean" });
  }

  if (req.user?.id === Number(id)) {
    return res.status(403).json({ message: "No puedes desactivar tu propia cuenta." });
  }

  try {
    const result = await pool.query(
      `
      UPDATE usuarios
      SET activo = $1
      WHERE id = $2
      RETURNING id, nombre, email, rol, activo
      `,
      [activo, Number(id)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({
      message: "Estado del usuario actualizado",
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error toggleUsuarioAuth:", error);
    return res.status(500).json({ message: "Error actualizando estado del usuario" });
  }
};

/* =========================================================================
   👤 Clientes Global (todas las empresas) - solo superadmin
======================================================================== */
export const listClientesGlobal = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        e.nombre AS empresa_nombre
      FROM clientes c
      LEFT JOIN empresas e ON e.id = c.empresa_id
      ORDER BY c.id DESC
    `);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error listClientesGlobal:", error);
    return res.status(500).json({ message: "Error listando clientes global" });
  }
};