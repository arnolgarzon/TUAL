// src/middleware/verificarToken.js
import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // IMPORTANTÍSIMO: unificamos el estándar
    req.user = {
      id: decoded.id,
      rol: decoded.rol,
      nombre: decoded.nombre,
      email: decoded.email,
      empresaId: decoded.empresaId ?? decoded.empresa_id ?? null, // por si hay tokens viejos
    };

    return next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido" });
  }
};