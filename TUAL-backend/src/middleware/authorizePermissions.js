import { pool } from "../config/db.js";

export const authorizePermissions = (required = []) => {
  if (!Array.isArray(required) || required.length === 0) {
    throw new Error("authorizePermissions requiere un array de permisos no vacío");
  }

  const requiredNormalized = required
    .map((p) => String(p || "").trim().toLowerCase())
    .filter(Boolean);

  if (requiredNormalized.length === 0) {
    throw new Error("authorizePermissions requiere permisos válidos");
  }

  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: "No autenticado" });

      const rol = String(req.user.rol || "").trim().toLowerCase();
      if (rol === "superadmin") return next();

      const empresaId = req.user.empresaId;
      if (!empresaId) return res.status(400).json({ error: "Falta empresaId en el token" });

      const { rows } = await pool.query(
        `SELECT permiso_clave
         FROM empresa_rol_permisos
         WHERE empresa_id = $1 AND rol = $2`,
        [empresaId, rol]
      );

      const userPerms = new Set(
        rows.map((r) => String(r.permiso_clave || "").trim().toLowerCase()).filter(Boolean)
      );

      const missing = requiredNormalized.filter((p) => !userPerms.has(p));
      if (missing.length > 0) {
        return res.status(403).json({ error: "No tienes permisos", missing });
      }

      if (!req.user.permissions) req.user.permissions = Array.from(userPerms);
      return next();
    } catch (err) {
      console.error("authorizePermissions error:", err);
      return res.status(500).json({ error: "Error validando permisos" });
    }
  };
};