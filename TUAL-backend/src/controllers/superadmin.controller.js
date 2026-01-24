import { pool } from "../config/db.js";

/**
 * 📊 Dashboard principal del sistema (SUPERADMIN)
 */
export const getSystemStats = async (req, res) => {
  try {
    const empresas = await pool.query("SELECT COUNT(*) FROM empresas");
    const usuarios = await pool.query("SELECT COUNT(*) FROM usuarios");
    const usuariosActivos = await pool.query(
      "SELECT COUNT(*) FROM usuarios WHERE activo = true"
    );

    res.status(200).json({
      sistema: "TUAL",
      stats: {
        empresas: Number(empresas.rows[0].count),
        usuarios: Number(usuarios.rows[0].count),
        usuariosActivos: Number(usuariosActivos.rows[0].count),
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("❌ Error stats:", error);
    res.status(500).json({ message: "Error obteniendo estadísticas" });
  }
};

/**
 * 🏢 Listar empresas (visión global superadmin)
 */
export const listEmpresas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        nombre,
        nit,
        telefono,
        email,
        sector,
        fecha_registro,
        admin_id
      FROM empresas
      ORDER BY fecha_registro DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error empresas:", error.message);
    res.status(500).json({
      message: "Error listando empresas",
    });
  }
};

/**
 * 👥 Listar usuarios (todas las empresas)
 */
export const listUsuarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, email, rol, empresa_id, activo, fecha_registro
      FROM usuarios
      ORDER BY fecha_registro DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error usuarios:", error);
    res.status(500).json({ message: "Error listando usuarios" });
  }
};

/**
 * 🔁 Activar / Suspender empresa
 */
export const toggleEmpresa = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  try {
    await pool.query(
      "UPDATE empresas SET activo = $1 WHERE id = $2",
      [activo, id]
    );

    res.json({ message: "Estado de empresa actualizado" });
  } catch (error) {
    console.error("❌ Error cambiando estado empresa:", error.message);
    res.status(500).json({ message: "Error actualizando empresa" });
  }
};

