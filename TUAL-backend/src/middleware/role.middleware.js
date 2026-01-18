// src/middlewares/role.middleware.js

/**
 * Middleware de autorización por rol
 * @param {...string|string[]} allowedRoles
 * Ejemplos válidos:
 *  authorizeRoles("superadmin")
 *  authorizeRoles("superadmin", "admin_empresa")
 *  authorizeRoles(["superadmin", "admin_empresa"])
 */
export const authorizeRoles = (...allowedRoles) => {
  // Soporta array o múltiples argumentos
  const rolesPermitidos = Array.isArray(allowedRoles[0])
    ? allowedRoles[0]
    : allowedRoles;

  // Normalizamos una sola vez
  const normalizedRoles = rolesPermitidos.map(role =>
    role.toLowerCase()
  );

  return (req, res, next) => {
    // 🔐 El usuario debe venir del verifyToken
    const usuario = req.usuario;

    if (!usuario || !usuario.rol) {
      return res.status(401).json({
        message: "Acceso denegado. Usuario no autenticado correctamente.",
      });
    }

    const userRole = usuario.rol.toLowerCase();

    // 🔍 Validar rol
    if (!normalizedRoles.includes(userRole)) {
      console.warn(
        `[AUTH] Acceso denegado | Rol: ${usuario.rol} | Permitidos: ${rolesPermitidos.join(", ")}`
      );

      return res.status(403).json({
        message: "No tiene permisos para acceder a este recurso.",
      });
    }

    /**
     * 🧩 FUTURO:
     * Aquí podremos validar:
     * - empresa_id
     * - permisos dinámicos
     * - scopes
     */

    next();
  };
};
