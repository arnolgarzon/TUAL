import { pool } from "../config/db.js";

/**
 * 📊 Información general del sistema
 */
export const getSystemStats = async (req, res) => {
  try {
    const empresas = await pool.query("SELECT COUNT(*) FROM empresas");
    const usuarios = await pool.query("SELECT COUNT(*) FROM usuarios");

    res.json({
      sistema: "TUAL",
      empresas: Number(empresas.rows[0].count),
      usuarios: Number(usuarios.rows[0].count),
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Error stats:", error);
    res.status(500).json({ message: "Error obteniendo estadísticas" });
  }
};

/**
 * 🏢 Listar empresas (visión global)
 */
export const listEmpresas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, nit, email, fecha_creacion
      FROM empresas
      ORDER BY fecha_creacion DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error empresas:", error);
    res.status(500).json({ message: "Error listando empresas" });
  }
};

/**
 * 👥 Listar usuarios (incluye superadmin)
 */
export const listUsuarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, email, rol, empresa_id, activo, fecha_registro
      FROM usuarios
      ORDER BY fecha_registro DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error usuarios:", error);
    res.status(500).json({ message: "Error listando usuarios" });
  }
};
