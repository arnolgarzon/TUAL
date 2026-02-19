// src/middlewares/role.middleware.js

export const authorizeRoles = (...allowedRoles) => {
  const rolesPermitidos = Array.isArray(allowedRoles[0])
    ? allowedRoles[0]
    : allowedRoles;

  const normalizedRoles = rolesPermitidos.map((r) =>
    String(r).toLowerCase()
  );

  return (req, res, next) => {
    try {
      // 🔐 Validar que exista usuario desde authMiddleware
      if (!req.user) {
        console.warn("[AUTH] req.user no existe");
        return res.status(401).json({
          message: "No autenticado. Token inválido o ausente.",
        });
      }

      if (!req.user.rol) {
        console.warn("[AUTH] Usuario sin rol definido");
        return res.status(401).json({
          message: "Usuario sin rol asignado.",
        });
      }

      const userRole = String(req.user.rol).toLowerCase();

      if (!normalizedRoles.includes(userRole)) {
        console.warn(
          `[AUTH] Acceso denegado | Rol usuario: ${req.user.rol} | Permitidos: ${normalizedRoles.join(
            ", "
          )}`
        );

        return res.status(403).json({
          message: "No tiene permisos para acceder a este recurso.",
        });
      }

      next();
    } catch (error) {
      console.error("[AUTH] Error en authorizeRoles:", error);
      return res.status(500).json({
        message: "Error interno en validación de roles.",
      });
    }
  };
};
