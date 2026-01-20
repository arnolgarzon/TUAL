// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      ok: false,
      message: "Token no proporcionado o formato inválido",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /**
     * 🔐 CONTEXTO GLOBAL DE USUARIO
     * Aquí vivirá TODO lo relacionado con identidad
     */
    req.user = {
      id: decoded.id,
      rol: decoded.rol,
      nombre: decoded.nombre,
      empresaId: decoded.empresaId ?? null, // preparado para multi-empresa
    };

    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: "Token inválido o expirado",
    });
  }
};
