// src/middlewares/role.middleware.js

/**
 * Middleware para restringir el acceso basado en el rol del usuario.
 * @param {Array<string>} allowedRoles - Lista de roles que tienen permiso (ej: ['Superadmin', 'admin_empresa'])
 * @returns {Function} - Middleware de Express
 */
export const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        // 🛑 CRÍTICO: El rol del usuario se debe obtener del token decodificado
        // que fue adjuntado por el middleware `verifyToken` a `req.usuario`.
        const userRole = req.usuario?.rol; 

        if (!userRole) {
            // Esto solo debería suceder si el auth.middleware falló o no se ejecutó.
            return res.status(401).json({ 
                message: "Acceso denegado. No se encontró información de rol en el token." 
            });
        }
        
        // ✅ MEJORA: Comprobación insensible a mayúsculas y minúsculas.
        // Convierte el rol del usuario a minúsculas y la lista de roles permitidos también.
        const hasPermission = allowedRoles
            .map(role => role.toLowerCase())
            .includes(userRole.toLowerCase());

        if (!hasPermission) {
            console.log(`Intento de acceso denegado. Rol: ${userRole}, Rutas permitidas: ${allowedRoles.join(', ')}`);
            return res.status(403).json({ 
                message: "Permiso denegado. No tiene el rol necesario para acceder a este recurso." 
            });
        }

        // Si el rol es válido, continúa con la ejecución de la ruta
        next();
    };
};