import { pool } from "../config/db.js";

// Obtener todos los vehículos
export const getVehiculos = async (req, res) => {
    try {
        const { rol, empresa_id } = req.usuario;
        let query = `
            SELECT v.*, c.nombre as nombre_cliente 
            FROM vehiculos v
            LEFT JOIN clientes c ON v.cliente_id = c.id
        `;
        let values = [];

        // Si no es superadmin, filtra por la empresa del cliente
        if (rol !== 'superadmin') {
            query += " WHERE c.empresa_id = $1";
            values.push(empresa_id);
        }
        query += " ORDER BY v.placa ASC";

        const result = await pool.query(query, values);
        res.status(200).json({
            message: "Lista de vehículos obtenida exitosamente",
            vehiculos: result.rows,
        });
    } catch (error) {
        console.error("Error al obtener vehículos:", error);
        res.status(500).json({ message: "Error interno al obtener vehículos" });
    }
};

// Obtener un vehículo por ID
export const getVehiculoById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM vehiculos WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Vehículo no encontrado" });
        }
        res.status(200).json({
            message: "Vehículo obtenido exitosamente",
            vehiculo: result.rows[0],
        });
    } catch (error) {
        console.error("Error al obtener vehículo por ID:", error);
        res.status(500).json({ message: "Error interno al obtener el vehículo" });
    }
};

// Crear un nuevo vehículo
export const createVehiculo = async (req, res) => {
    try {
        const { placa, marca, modelo, ano, color, vin, cliente_id } = req.body;

        const query = `
            INSERT INTO vehiculos (placa, marca, modelo, ano, color, vin, cliente_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `;
        const values = [placa, marca, modelo, ano, color, vin, cliente_id];

        const result = await pool.query(query, values);
        res.status(201).json({
            message: "Vehículo creado exitosamente",
            vehiculo: result.rows[0],
        });
    } catch (error) {
        console.error("Error al crear vehículo:", error);
        res.status(500).json({ message: "Error interno al crear el vehículo" });
    }
};

// Actualizar un vehículo
export const updateVehiculo = async (req, res) => {
    try {
        const { id } = req.params;
        const { placa, marca, modelo, ano, color, vin, cliente_id } = req.body;
        const result = await pool.query(
            "UPDATE vehiculos SET placa = $1, marca = $2, modelo = $3, ano = $4, color = $5, vin = $6, cliente_id = $7 WHERE id = $8 RETURNING *",
            [placa, marca, modelo, ano, color, vin, cliente_id, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Vehículo no encontrado" });
        }
        res.status(200).json({
            message: "Vehículo actualizado exitosamente",
            vehiculo: result.rows[0],
        });
    } catch (error) {
        console.error("Error al actualizar vehículo:", error);
        res.status(500).json({ message: "Error interno al actualizar el vehículo" });
    }
};

// Eliminar un vehículo
export const deleteVehiculo = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM vehiculos WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Vehículo no encontrado" });
        }
        res.status(200).json({ message: "Vehículo eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar vehículo:", error);
        res.status(500).json({ message: "Error interno al eliminar el vehículo" });
    }
};