import { pool } from "../config/db.js";

// Obtener todos los clientes
export const getClientes = async (req, res) => {
    try {
        const { rol, empresa_id } = req.usuario;
        let query = "SELECT * FROM clientes";
        let values = [];

        // Si el usuario no es superadmin, filtra los clientes por su empresa
        if (rol !== 'superadmin') {
            query += " WHERE empresa_id = $1";
            values.push(empresa_id);
        }
        query += " ORDER BY nombre ASC";

        const result = await pool.query(query, values);
        res.status(200).json({
            message: "Lista de clientes obtenida exitosamente",
            clientes: result.rows,
        });
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ message: "Error interno al obtener clientes" });
    }
};

// Obtener un cliente por ID
export const getClienteById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM clientes WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.status(200).json({
            message: "Cliente obtenido exitosamente",
            cliente: result.rows[0],
        });
    } catch (error) {
        console.error("Error al obtener cliente por ID:", error);
        res.status(500).json({ message: "Error interno al obtener el cliente" });
    }
};

// Crear un nuevo cliente
export const createCliente = async (req, res) => {
    try {
        const { nombre, telefono, email, direccion } = req.body;
        const { empresa_id } = req.usuario; // El cliente se asocia a la empresa del usuario que lo crea

        const query = `
            INSERT INTO clientes (nombre, telefono, email, direccion, empresa_id)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;
        const values = [nombre, telefono, email, direccion, empresa_id];

        const result = await pool.query(query, values);
        res.status(201).json({
            message: "Cliente creado exitosamente",
            cliente: result.rows[0],
        });
    } catch (error) {
        console.error("Error al crear cliente:", error);
        res.status(500).json({ message: "Error interno al crear el cliente" });
    }
};

// Actualizar un cliente
export const updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, telefono, email, direccion } = req.body;
        const result = await pool.query(
            "UPDATE clientes SET nombre = $1, telefono = $2, email = $3, direccion = $4 WHERE id = $5 RETURNING *",
            [nombre, telefono, email, direccion, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.status(200).json({
            message: "Cliente actualizado exitosamente",
            cliente: result.rows[0],
        });
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        res.status(500).json({ message: "Error interno al actualizar el cliente" });
    }
};

// Eliminar un cliente
export const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM clientes WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.status(200).json({ message: "Cliente eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        res.status(500).json({ message: "Error interno al eliminar el cliente" });
    }
};