// src/middlewares/role.middleware.js

export const authorizeRoles = (...allowedRoles) => {
  const rolesPermitidos = Array.isArray(allowedRoles[0])
    ? allowedRoles[0]
    : allowedRoles;

  const normalizedRoles = rolesPermitidos.map(r => r.toLowerCase());

  return (req, res, next) => {
    const usuario = req.user;

    if (!usuario || !usuario.rol) {
      return res.status(401).json({
        message: "Acceso denegado. Usuario no autenticado.",
      });
    }

    const userRole = usuario.rol.toLowerCase();

    if (!normalizedRoles.includes(userRole)) {
      console.warn(
        `[AUTH] Rol rechazado | Rol usuario: ${usuario.rol} | Permitidos: ${rolesPermitidos.join(", ")}`
      );

      return res.status(403).json({
        message: "No tiene permisos para acceder a este recurso.",
      });
    }

    next();
  };
};
