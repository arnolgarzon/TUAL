// src/controllers/auth.controller.js

import { pool } from "../config/db.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

// Constantes
const saltRounds = 10;

// =========================================================================
// 1. REGISTRO DE NUEVO USUARIO
// =========================================================================
export const register = async (req, res) => {
    try {
        // 1. Capturar errores de validación del middleware
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, email, password } = req.body;

        // 2. Verificar si el email ya existe
        const emailCheck = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(409).json({ message: "El email ya está registrado." });
        }

        // 3. Hashing de la contraseña
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Insertar nuevo usuario (con rol 'empleado' por defecto)
        const query = `
            INSERT INTO usuarios (nombre, email, password, rol) 
            VALUES ($1, $2, $3, 'empleado') 
            RETURNING id, nombre, email, rol
        `;
        const result = await pool.query(query, [nombre, email, hashedPassword]);
        const nuevoUsuario = result.rows[0];

        // 5. Crear y firmar el token para el nuevo usuario
        const tokenPayload = {
            id: nuevoUsuario.id,
            rol: nuevoUsuario.rol,
            nombre: nuevoUsuario.nombre // Añadido para mejor consistencia con el login
        };
        
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Envía el token y los datos limpios del nuevo usuario
        res.status(201).json({ 
            message: "Registro exitoso.", 
            token, 
            usuario: nuevoUsuario // nuevoUsuario ya tiene los campos limpios gracias al RETURNING
        });
        
    } catch (err) {
        console.error("Error en registro:", err.message);
        res.status(500).json({ error: "Error interno al registrar el usuario." });
    }
};

// =========================================================================
// 2. INICIO DE SESIÓN (LOGIN)
// =========================================================================

export const login = async (req, res) => {
    try {
        // 1. Capturar errores de validación del middleware (si los hay)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // 2. Buscar al usuario por email
        const userResult = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "Credenciales incorrectas." }); // Mensaje genérico por seguridad
        }

        const usuario = userResult.rows[0];

        // 3. Comparar la contraseña proporcionada con la hasheada en la DB
        const isMatch = await bcrypt.compare(password, usuario.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales incorrectas." }); // Mensaje genérico
        }

        // 4. Crear el payload del token (información que se guarda en el token)
        const tokenPayload = {
            id: usuario.id,
            rol: usuario.rol,
            nombre: usuario.nombre
        };

        // 5. Firmar el token
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });

        // 6. Enviar respuesta exitosa
        res.status(200).json({
            message: "Login exitoso.",
            token,
            usuario: tokenPayload // Enviar los datos del usuario para el frontend
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error interno en login." });
    }
};