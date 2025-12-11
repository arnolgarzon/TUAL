// src/controllers/usuarios.controller.js

import { pool } from "../config/db.js";
import bcrypt from 'bcryptjs'; // 🛑 NECESARIO: Importar bcrypt para hashing de contraseñas

// Constantes de Hashing (ajustar según necesidad)
const saltRounds = 10; 

// -------------------------------------------------------------------
// HELPER: Seleccionar campos seguros para el retorno
// -------------------------------------------------------------------
const SAFE_USER_FIELDS = `
    u.id, 
    u.nombre, 
    u.email, 
    u.rol, 
    u.empresa_id,
    u.created_at,
    e.nombre AS nombre_empresa
`;
// JOIN con empresas para facilitar el frontend
const USER_JOIN_COMPANY = `
    FROM 
        usuarios u
    LEFT JOIN 
        empresas e ON u.empresa_id = e.id
`;

// -------------------------------------------------------------------
// 1. LISTAR TODOS LOS USUARIOS (READ ALL) - (listAllUsers en Rutas)
// -------------------------------------------------------------------
export const listAllUsers = async (req, res) => {
    try {
        // 🛑 MEJORA 1: Retorno de campos selectivos y JOIN con empresa
        const query = `
            SELECT ${SAFE_USER_FIELDS}
            ${USER_JOIN_COMPANY}
            ORDER BY u.id DESC
        `;
        
        const result = await pool.query(query);
        
        res.status(200).json({
            message: "Lista de usuarios obtenida exitosamente",
            total: result.rows.length,
            usuarios: result.rows,
        });
        
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        res.status(500).json({ message: "Error interno del servidor al obtener los usuarios" });
    }
};

// -------------------------------------------------------------------
// 2. BUSCAR POR ID (READ ONE) - (getUsuarioById en Rutas)
// -------------------------------------------------------------------
export const getUsuarioById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 🛑 MEJORA: Retorno de campos selectivos y JOIN
        const query = `
            SELECT ${SAFE_USER_FIELDS} 
            ${USER_JOIN_COMPANY} 
            WHERE u.id = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json(result.rows[0]);
        
    } catch (error) {
        console.error("Error al obtener el usuario por ID:", error);
        res.status(500).json({ message: "Error interno del servidor al obtener el usuario" });
    }
};

// -------------------------------------------------------------------
// 3. CREAR USUARIO (CREATE) - (createUser en Rutas)
// -------------------------------------------------------------------
export const createUser = async (req, res) => {
    const { nombre, email, password, rol, empresa_id } = req.body; // 🛑 INCLUIR rol y empresa_id

    try {
        // 🛑 ROBUSTEZ 1: Validar campos requeridos
        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({ message: "Nombre, email, contraseña y rol son requeridos." });
        }

        // 🛑 ROBUSTEZ 2: Verificar si el email ya existe
        const emailCheck = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(409).json({ message: "El email ya está registrado." });
        }

        // 🛑 SEGURIDAD: Hashing de la contraseña antes de guardar
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 🛑 MEJORA: Incluir rol y empresa_id en la inserción
        const query = `
            INSERT INTO usuarios (nombre, email, password, rol, empresa_id) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, nombre, email, rol, empresa_id
        `;
        
        const result = await pool.query(query, [nombre, email, hashedPassword, rol, empresa_id || null]);

        res.status(201).json(result.rows[0]); // Devolver el nuevo usuario (sin password)
        
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(500).json({ message: "Error interno del servidor al crear el usuario" });
    }
};

// -------------------------------------------------------------------
// 4. ACTUALIZAR USUARIO (UPDATE) - (updateUser en Rutas)
// -------------------------------------------------------------------
export const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, rol, empresa_id, password } = req.body;
        
        let queryParts = [];
        let queryValues = [];
        let index = 1;

        // 🛑 ROBUSTEZ: Construir la consulta dinámicamente
        if (nombre !== undefined) {
            queryParts.push(`nombre = $${index++}`);
            queryValues.push(nombre);
        }
        if (email !== undefined) {
            queryParts.push(`email = $${index++}`);
            queryValues.push(email);
        }
        if (rol !== undefined) {
            queryParts.push(`rol = $${index++}`);
            queryValues.push(rol);
        }
        if (empresa_id !== undefined) {
            queryParts.push(`empresa_id = $${index++}`);
            queryValues.push(empresa_id || null);
        }
        
        // 🛑 SEGURIDAD: Hashing de nueva contraseña (si se proporciona)
        if (password) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            queryParts.push(`password = $${index++}`);
            queryValues.push(hashedPassword);
        }

        if (queryParts.length === 0) {
            return res.status(400).json({ message: "No hay campos para actualizar." });
        }

        queryValues.push(id); // Último valor es el ID

        const query = `
            UPDATE usuarios 
            SET ${queryParts.join(', ')} 
            WHERE id = $${index} 
            RETURNING id, nombre, email, rol, empresa_id
        `;
        
        const result = await pool.query(query, queryValues);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json(result.rows[0]); 
        
    } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        res.status(500).json({ message: "Error interno del servidor al actualizar el usuario" });
    }
};

// -------------------------------------------------------------------
// 5. ELIMINAR USUARIO (DELETE) - (deleteUser en Rutas)
// -------------------------------------------------------------------
export const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        // 🛑 MEJORA: Usar el rol del usuario que hace la solicitud para prevenir auto-eliminación
        // Opcional: Si el req.usuario.rol es 'super_usuario', permitir. Pero debemos prevenir que se elimine a sí mismo.
        if (req.usuario.id === parseInt(id)) {
             return res.status(403).json({ message: "No puedes eliminar tu propia cuenta." });
        }
        
        const result = await pool.query(
            "DELETE FROM usuarios WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({ message: `Usuario con ID ${id} eliminado exitosamente.` });
        
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ message: "Error interno del servidor al eliminar usuario" });
    }
};