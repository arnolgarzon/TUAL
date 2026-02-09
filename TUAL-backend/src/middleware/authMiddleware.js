// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * Middleware JWT:
 * - Espera header: Authorization: Bearer <token>
 * - Setea req.user = { id, rol, nombre, email, empresaId }
 *
 * Exporta:
 * - default:  import authMiddleware from ...
 * - named:    import { authMiddleware } from ...
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        ok: false,
        message: "Token no proporcionado o formato inválido",
      });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
      return res.status(401).json({
        ok: false,
        message: "Token no proporcionado",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        ok: false,
        message: "JWT_SECRET no está configurado en el servidor",
      });
    }

    const decoded = jwt.verify(token, secret);

    const rol = String(decoded.rol || "").trim().toLowerCase();
    const empresaId = decoded.empresaId ?? null;

    // Para superadmin permitimos empresaId null; para otros roles debe existir
    if (rol !== "superadmin" && !empresaId) {
      return res.status(401).json({
        ok: false,
        message: "Token inválido: falta empresaId",
      });
    }

    req.user = {
      id: decoded.id,
      rol,
      nombre: decoded.nombre ?? null,
      email: decoded.email ?? null,
      empresaId,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: "Token inválido o expirado",
    });
  }
};

// ✅ named export (para imports con llaves)
export { authMiddleware };

// ✅ default export (para imports sin llaves)
export default authMiddleware;