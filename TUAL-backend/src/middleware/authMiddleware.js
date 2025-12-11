// src/middlewares/authMiddleware.js

import jwt from "jsonwebtoken";

// 🛑 MEJORA 1: Renombrar para consistencia (Si tus rutas usan 'verifyToken')
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        // 🛑 MEJORA 2: Usar 401 (Unauthorized) en lugar de 403 (Forbidden)
        // 401 indica que el cliente DEBE autenticarse (proporcionar el token).
        return res.status(401).json({ 
            message: "Acceso denegado. No se proporcionó un token." 
        });
    }

    try {
        // 🛑 ASUNCIÓN: process.env.JWT_SECRET está disponible (verificado).
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        
        // 🛑 CRÍTICO: Adjuntar el payload (rol, id, etc.) para que lo use role.middleware.js
        req.usuario = decoded; 
        
        next();
        
    } catch (err) {
        // 401: Token mal formado, expirado, o firma inválida.
        return res.status(401).json({ 
            message: "Token inválido o expirado." 
        });
    }
};
