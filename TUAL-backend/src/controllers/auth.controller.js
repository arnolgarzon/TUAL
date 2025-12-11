// src/controllers/auth.controller.js

import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator"; 

// 🛑 MEJORA DE SEGURIDAD: Definir la fuerza del hash en una constante de archivo
const saltRounds = 10; 

// =========================================================================
// 1. REGISTRO (REGISTER)
// =========================================================================

export const register = async (req, res) => {
    // 1. Capturar y manejar errores de validación del middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: "Error de validación de datos.",
            details: errors.array() 
        });
    }

    // El frontend nos envía 'nombre' (nombreEmpresa), 'email' y 'password'
    const { nombre, email, password } = req.body;
    
    try {
        // 2. Verificar si el usuario/email ya existe
        const existingUser = await pool.query("SELECT email FROM usuarios WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            // Usar 409 (Conflict) para indicar que el recurso ya existe
            return res.status(409).json({ error: "Este correo electrónico ya está registrado." });
        }

        // 3. Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Inserción en la base de datos (Rol por defecto: 'admin_empresa')
        const result = await pool.query(
            "INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol",
            [nombre, email, hashedPassword, 'admin_empresa'] 
        );
        
        const nuevoUsuario = result.rows[0];

        // 5. Generar token de sesión
        const tokenPayload = { 
            id: nuevoUsuario.id, 
            email: nuevoUsuario.email, 
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
    // 1. Capturar errores de validación del middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: "Datos de login incompletos o incorrectos.", // Mensaje más genérico
            details: errors.array() 
        });
    }
    
    const { email, password } = req.body;
    
    // 🛑 MEJORA: Eliminado console.log(email, password) por seguridad.
    // console.log("Intentando login con:", email); // Esto es solo para debug, se puede mantener

    try {
        // 2. Buscar al usuario
        const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        const usuario = result.rows[0];

        if (!usuario) {
            // Credenciales inválidas (usuario no existe)
            return res.status(401).json({ error: "Credenciales inválidas." });
        }

        // 3. Comparar contraseñas
        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) {
            // Contraseña incorrecta
            return res.status(401).json({ error: "Credenciales inválidas." });
        }

        // 4. Generar el payload del token con datos necesarios para el frontend/middleware
        const tokenPayload = { 
            id: usuario.id, 
            email: usuario.email, 
            rol: usuario.rol,
            nombre: usuario.nombre 
        };
        
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // 5. Limpiar datos del usuario antes de enviar (Excluir la contraseña hasheada)
        const { password: _, ...cleanedUser } = usuario;

        res.json({ token, usuario: cleanedUser });
        
    } catch (err) {
        console.error("Error en login:", err.message);
        res.status(500).json({ error: "Error interno en login." });
    }
};


// =========================================================================
// 3. GESTIÓN DE USUARIOS (SUPER ADMIN)
// =========================================================================

// Función para obtener todos los usuarios registrados
// Protegida por el middleware 'esSuperAdmin' en el archivo de rutas.
export const getUsers = async (req, res) => {
    try {
        const result = await pool.query( 
            // 🛑 Excluimos la columna 'password' por seguridad
            "SELECT id, nombre, email, rol FROM usuarios ORDER BY id ASC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener usuarios:", err.message);
        res.status(500).json({ error: "Error interno al obtener la lista de usuarios." });
    }
};

// 🛑 MEJORA DE FUTURO: Cambiar el rol de un usuario (Acceso Super Admin)
export const updateRole = async (req, res) => {
    const { userId } = req.params;
    const { newRole } = req.body;

    // 🛑 Validación: Asegurar que el rol es uno permitido para evitar inyecciones
    const validRoles = ['superadmin', 'admin_empresa', 'empleado'];
    if (!validRoles.includes(newRole)) {
        return res.status(400).json({ error: "Rol no válido." });
    }

    try {
        const result = await pool.query(
            "UPDATE usuarios SET rol = $1 WHERE id = $2 RETURNING id, nombre, email, rol",
            [newRole, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        res.json({ 
            message: `Rol del usuario ${userId} actualizado a ${newRole}.`, 
            usuario: result.rows[0] 
        });

    } catch (err) {
        console.error("Error al actualizar rol:", err.message);
        res.status(500).json({ error: "Error interno al actualizar el rol." });
    }
};