import { pool } from "../config/db.js";

/**
 * Inserta defaults de permisos por empresa+rol (si no existen).
 * - admin_empresa: todos los permisos base
 * - empleado: solo clientes.ver (ajústalo si quieres)
 */
async function ensureDefaults(empresaId) {
  const defaults = [
    // admin_empresa
    ["admin_empresa", "clientes.ver"],
    ["admin_empresa", "clientes.crear"],
    ["admin_empresa", "clientes.editar"],
    ["admin_empresa", "clientes.eliminar"],
    ["admin_empresa", "usuarios.ver"],
    ["admin_empresa", "usuarios.crear"],
    ["admin_empresa", "usuarios.editar"],
    ["admin_empresa", "usuarios.desactivar"],
    ["admin_empresa", "permisos.ver"],
    ["admin_empresa", "permisos.editar"],

    // empleado
    ["empleado", "clientes.ver"],
  ];

  const q = `
    INSERT INTO empresa_rol_permisos (empresa_id, rol, permiso_clave)
    VALUES ($1, $2, $3)
    ON CONFLICT (empresa_id, rol, permiso_clave) DO NOTHING
  `;

  for (const [rol, permiso] of defaults) {
    await pool.query(q, [empresaId, rol, permiso]);
  }
}

export const listPermisosCatalogo = async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT clave FROM permisos ORDER BY clave`);
    res.json({ permisos: rows.map((r) => r.clave) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error listando permisos" });
  }
};

export const listRolesEmpresa = async (req, res) => {
  try {
    const empresaId = req.user.empresaId;
    await ensureDefaults(empresaId);

    const { rows } = await pool.query(
      `SELECT DISTINCT rol
       FROM empresa_rol_permisos
       WHERE empresa_id = $1
       ORDER BY rol`,
      [empresaId]
    );

    res.json({ roles: rows.map((r) => r.rol) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error listando roles" });
  }
};

export const getPermisosByRol = async (req, res) => {
  try {
    const empresaId = req.user.empresaId;
    const rol = String(req.params.rol || "").toLowerCase();

    await ensureDefaults(empresaId);

    const { rows } = await pool.query(
      `SELECT permiso_clave
       FROM empresa_rol_permisos
       WHERE empresa_id = $1 AND rol = $2
       ORDER BY permiso_clave`,
      [empresaId, rol]
    );

    res.json({ rol, permisos: rows.map((r) => r.permiso_clave) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error consultando permisos del rol" });
  }
};

export const replacePermisosByRol = async (req, res) => {
  const client = await pool.connect();
  try {
    const empresaId = req.user.empresaId;
    const rol = String(req.params.rol || "").toLowerCase();
    const { permisos } = req.body; // array de claves

    if (!Array.isArray(permisos)) {
      return res.status(400).json({ error: "permisos debe ser un array de claves" });
    }

    // Validar catálogo: todas deben existir en permisos.clave
    const cat = await client.query(
      `SELECT clave FROM permisos WHERE clave = ANY($1::text[])`,
      [permisos]
    );
    const found = new Set(cat.rows.map((r) => r.clave));
    const missing = permisos.filter((p) => !found.has(p));
    if (missing.length > 0) {
      return res.status(400).json({ error: "Permisos inválidos", missing });
    }

    await client.query("BEGIN");

    // Reemplazar: borrar y reinsertar
    await client.query(
      `DELETE FROM empresa_rol_permisos WHERE empresa_id = $1 AND rol = $2`,
      [empresaId, rol]
    );

    for (const p of permisos) {
      await client.query(
        `INSERT INTO empresa_rol_permisos (empresa_id, rol, permiso_clave)
         VALUES ($1, $2, $3)
         ON CONFLICT (empresa_id, rol, permiso_clave) DO NOTHING`,
        [empresaId, rol, p]
      );
    }

    await client.query("COMMIT");

    res.json({ message: "Permisos actualizados", rol, permisos });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(err);
    res.status(500).json({ error: "Error actualizando permisos del rol" });
  } finally {
    client.release();
  }
};