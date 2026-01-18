// src/controllers/auth.controller.js

import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

const saltRounds = 10;

/* =========================================================================
   REGISTRO DE USUARIO (NO USADO PARA EMPRESA)
   Se mantiene para futuro (empleados, invitaciones, etc.)
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
      VALUES ($1, $2, $3, 'EMPLEADO')
      RETURNING id, nombre, email, rol, empresa_id
    `;

    const { rows } = await pool.query(query, [
      nombre,
      email,
      hashedPassword,
    ]);

    const usuario = rows[0];

    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol,
        empresa_id: usuario.empresa_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Registro exitoso",
      token,
      usuario,
    });

  } catch (error) {
    console.error("❌ Error en registro:", error);
    res.status(500).json({
      error: "Error interno al registrar usuario",
    });
  }
};

/* =========================================================================
   LOGIN (ADMIN / EMPLEADO)
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

    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Credenciales incorrectas",
      });
    }

    const usuario = result.rows[0];

    const isMatch = await bcrypt.compare(password, usuario.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Credenciales incorrectas",
      });
    }

    const tokenPayload = {
      id: usuario.id,
      rol: usuario.rol,
      empresa_id: usuario.empresa_id,
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
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
    res.status(500).json({
      error: "Error interno en login",
    });
  }
};
