import { pool } from "../config/db.js";

/**
 * 📊 Dashboard principal del sistema (SUPERADMIN)
 * Métricas globales
 */
export const getSystemStats = async (req, res) => {
  try {
    const [
      empresas,
      clientes,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM empresas"),
      pool.query("SELECT COUNT(*) FROM clientes"),
    ]);

    res.status(200).json({
      sistema: "TUAL",
      stats: {
        empresas: Number(empresas.rows[0].count),
        clientes: Number(clientes.rows[0].count),
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("❌ Error stats:", error.message);
    res.status(500).json({
      message: "Error obteniendo estadísticas del sistema",
    });
  }
};

/**
 * 🏢 Listar empresas (visión global superadmin)
 */
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
        COUNT(c.id) AS total_clientes
      FROM empresas e
      LEFT JOIN clientes c ON c.empresa_id = e.id
      GROUP BY e.id
      ORDER BY e.fecha_registro DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error empresas:", error.message);
    res.status(500).json({
      message: "Error listando empresas",
    });
  }
};

/**
 * 👥 Listar usuarios (clientes de todas las empresas)
 * 🔥 Vista GLOBAL para superadmin
 */
export const listUsuarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.nombre,
        c.documento,
        c.telefono,
        c.email,
        c.created_at,
        e.id AS empresa_id,
        e.nombre AS empresa_nombre
      FROM clientes c
      INNER JOIN empresas e ON e.id = c.empresa_id
      ORDER BY c.created_at DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error usuarios:", error.message);
    res.status(500).json({
      message: "Error listando usuarios del sistema",
    });
  }
};

/**
 * 🔁 Activar / Suspender empresa
 * ⚠️ Requiere columna `activo` en empresas
 */
export const toggleEmpresa = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  if (typeof activo !== "boolean") {
    return res.status(400).json({
      message: "El campo 'activo' debe ser boolean",
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE empresas
      SET activo = $1
      WHERE id = $2
      RETURNING id, nombre, activo
      `,
      [activo, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    res.status(200).json({
      message: "Estado de empresa actualizado",
      empresa: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error cambiando estado empresa:", error.message);
    res.status(500).json({
      message: "Error actualizando estado de empresa",
    });
  }
};
