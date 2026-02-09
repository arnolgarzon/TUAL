// src/middleware/requireModule.js
import { pool } from "../config/db.js";

/**
 * Middleware: requireModule("clientes")
 * Valida que el módulo esté habilitado para la empresa del usuario.
 *
 * Reglas:
 * - Requiere auth previo (req.user)
 * - superadmin bypass (no depende de empresa)
 * - Si no hay registro en empresa_modulos => se asume DESHABILITADO
 */
export const requireModule = (modulo) => {
  if (!modulo || typeof modulo !== "string") {
    throw new Error("requireModule(modulo) requiere un 'modulo' string no vacío");
  }

  const moduloNorm = modulo.trim().toLowerCase();

  return async (req, res, next) => {
    try {
      // Debe venir de authMiddleware
      if (!req.user) {
        return res.status(401).json({
          ok: false,
          message: "No autenticado",
        });
      }

      // superadmin bypass
      const rol = String(req.user.rol || "").trim().toLowerCase();
      if (rol === "superadmin") return next();

      const empresaId = req.user.empresaId;
      if (!empresaId) {
        return res.status(403).json({
          ok: false,
          message: "No tienes empresa asociada para usar módulos",
          code: "NO_EMPRESA",
        });
      }

      const { rows } = await pool.query(
        `SELECT enabled
         FROM empresa_modulos
         WHERE empresa_id = $1 AND LOWER(modulo) = $2
         LIMIT 1`,
        [empresaId, moduloNorm]
      );

      const enabled = rows.length > 0 && rows[0].enabled === true;

      // Si no existe registro, por defecto lo tratamos como DESHABILITADO
      if (!enabled) {
        return res.status(403).json({
          ok: false,
          message: `El módulo '${moduloNorm}' no está habilitado para tu empresa`,
          code: "MODULE_DISABLED",
          modulo: moduloNorm,
        });
      }

      // Marca informativa (por si quieres auditar o debug)
      req.user.modules = req.user.modules || {};
      req.user.modules[moduloNorm] = true;

      return next();
    } catch (error) {
      console.error("❌ requireModule error:", error);
      return res.status(500).json({
        ok: false,
        message: "Error validando módulo",
        code: "MODULE_CHECK_FAILED",
      });
    }
  };
};

export default requireModule;