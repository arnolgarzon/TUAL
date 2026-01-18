// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verificamos si viene el token
  if (!authHeader) {
    return res.status(401).json({
      ok: false,
      message: "Token no proporcionado",
    });
  }

  // Formato esperado: Bearer TOKEN
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // guardamos el usuario para el controlador
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: "Token inválido o expirado",
    });
  }
};
