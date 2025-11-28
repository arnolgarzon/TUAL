// src/controllers/auth.controller.js

import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator"; // 🛑 NUEVO: Para manejar la validación de express-validator

// ----------------------------------------------------
// 1. FUNCIÓN DE REGISTRO (SOLUCIONA EL ERROR DE RUTA)
// ----------------------------------------------------

export const register = async (req, res) => {
    // 1. Capturar y manejar errores de validación del middleware (express-validator)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Devolver un error 400 (Bad Request) con detalles de la validación
        return res.status(400).json({ 
            error: "Error de validación",
            details: errors.array() 
        });
    }

    // El frontend nos envía 'nombre' (nombreEmpresa), 'email' y 'password'
    const { nombre, email, password } = req.body;
    
    // 🛑 MEJORA DE SEGURIDAD: Definir la fuerza del hash
    const saltRounds = 10; 

    try {
        // 2. Verificar si el usuario/email ya existe
        const existingUser = await pool.query("SELECT email FROM usuarios WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            // Error 409 (Conflict) para indicar que el recurso ya existe
            return res.status(409).json({ error: "Este correo electrónico ya está registrado." });
        }

        // 3. Hashear la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Inserción en la base de datos (Asumo que el rol por defecto es 'user' o 'admin')
        const result = await pool.query(
            "INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol",
            [nombre, email, hashedPassword, 'admin_empresa'] // Asumo un rol inicial para los negocios
        );
        
        const nuevoUsuario = result.rows[0];

        // 5. Generar token de sesión inmediato (opcional, pero buena UX)
        const token = jwt.sign(
            { id: nuevoUsuario.id, email: nuevoUsuario.email, rol: nuevoUsuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Envía el token y los datos del nuevo usuario
        res.status(201).json({ 
            message: "Registro exitoso.", 
            token, 
            usuario: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email,
                rol: nuevoUsuario.rol
            }
        });
        
    } catch (err) {
        console.error("Error en registro:", err.message);
        res.status(500).json({ error: "Error interno al registrar el usuario." });
    }
};


// ----------------------------------------------------
// 2. FUNCIÓN DE LOGIN (Mejoras menores)
// ----------------------------------------------------

export const login = async (req, res) => {
    // 1. Capturar errores de validación del middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: "Datos de login incompletos.",
            details: errors.array() 
        });
    }
    
    const { email, password } = req.body;
    console.log(email, password)
    console.log("Intentando login con:", email);

    try {
        const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        const usuario = result.rows[0];

        if (!usuario) {
            // 🛑 MEJORA UX: Mensaje genérico para no dar pistas al atacante
            return res.status(401).json({ error: "Credenciales inválidas." });
        }

        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) {
            // 🛑 MEJORA UX: Mensaje genérico para no dar pistas al atacante
            return res.status(401).json({ error: "Credenciales inválidas." });
        }

        // 🛑 MEJORA: Definir qué datos va en el token (NO la contraseña)
        const tokenPayload = { 
            id: usuario.id, 
            email: usuario.email, 
            rol: usuario.rol,
            nombre: usuario.nombre // Añadir el nombre al payload del token
        };
        
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // 🛑 MEJORA: Solo devolver datos limpios del usuario al frontend
        const cleanedUser = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
        };

        res.json({ token, usuario: cleanedUser });
    } catch (err) {
        console.error("Error en login:", err.message);
        res.status(500).json({ error: "Error interno en login" });
    }
};