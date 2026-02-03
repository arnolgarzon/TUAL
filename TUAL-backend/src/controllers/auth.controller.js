// src/controllers/auth.controller.js
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

const saltRounds = 10;

const signToken = (usuario) => {
  const tokenPayload = {
    id: usuario.id,
    rol: usuario.rol,
    empresaId: usuario.empresa_id ?? null, // viene de la BD
    nombre: usuario.nombre,
    email: usuario.email,
  };

  return jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

/* =========================================================================
   REGISTRO DE USUARIO
======================================================================== */
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: errors.array(),
      });
    }

    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: "Nombre, email y contraseña son obligatorios",
      });
    }

    const emailCheck = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        error: "El email ya está registrado",
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES ($1, $2, $3, 'empleado')
      RETURNING id, nombre, email, rol, empresa_id
    `;

    const { rows } = await pool.query(query, [nombre, email, hashedPassword]);
    const usuario = rows[0];

    const token = signToken(usuario);

    return res.status(201).json({
      message: "Registro exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        empresa_id: usuario.empresa_id,
      },
    });
  } catch (error) {
    console.error("❌ Error en registro:", error);
    return res.status(500).json({
      error: "Error interno al registrar usuario",
    });
  }
};

/* =========================================================================
   LOGIN
======================================================================== */
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email y contraseña son obligatorios",
      });
    }

    // ✅ FIX: Selecciona columnas explícitas e incluye password para validar credenciales
    const result = await pool.query(
      `
      SELECT id, nombre, email, password, rol, empresa_id
      FROM usuarios
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const usuario = result.rows[0];

    // ✅ Defensa extra: si por alguna razón password está NULL/vacío en BD
    if (!usuario.password) {
      console.error("🔥 Login: el usuario no tiene password almacenado en BD", {
        userId: usuario.id,
        email: usuario.email,
      });
      return res.status(500).json({
        error: "Error interno de autenticación",
      });
    }

    const isMatch = await bcrypt.compare(String(password), usuario.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = signToken(usuario);

    return res.status(200).json({
      message: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        empresa_id: usuario.empresa_id,
      },
    });
  } catch (error) {
    console.error("🔥 Error en login:", error);
    return res.status(500).json({
      error: "Error interno en login",
    });
  }
};