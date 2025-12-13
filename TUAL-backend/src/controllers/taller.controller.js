import { pool } from "../config/db.js";

// Obtener todas las órdenes de taller
export const getOrdenes = async (req, res) => {
    try {
        // ✅ MEJORA: Unir tablas para obtener la información completa
        const query = `
            SELECT o.*, c.nombre as cliente_nombre, v.placa as vehiculo_placa, v.marca as vehiculo_marca, v.modelo as vehiculo_modelo
            FROM ordenes_taller o
            LEFT JOIN clientes c ON o.cliente_id = c.id
            LEFT JOIN vehiculos v ON o.vehiculo_id = v.id
            ORDER BY o.fecha_recepcion DESC
        `;
        const result = await pool.query(query);
        res.status(200).json({
            message: "Lista de órdenes obtenida exitosamente",
            ordenes: result.rows,
        });
    } catch (error) {
        console.error("Error al obtener órdenes:", error);
        res.status(500).json({ message: "Error al obtener órdenes de taller" });
    }
};

// Obtener una orden por ID
export const getOrdenById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM ordenes_taller WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }
        res.status(200).json({
            message: "Orden obtenida exitosamente",
            orden: result.rows[0],
        });
    } catch (error) {
        console.error("Error al obtener orden por ID:", error);
        res.status(500).json({ message: "Error al obtener la orden" });
    }
};

// Crear una nueva orden de taller
export const createOrden = async (req, res) => {
    try {
        const { cliente_id, vehiculo_id, motivo_visita, estado } = req.body;
        const { id: usuario_id, empresa_id } = req.usuario; // Obtenido del token

        const query = `
            INSERT INTO ordenes_taller (motivo_visita, estado, usuario_id, empresa_id, cliente_id, vehiculo_id)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const values = [motivo_visita, estado || 'Recibido', usuario_id, empresa_id, cliente_id, vehiculo_id];

        const result = await pool.query(query, values);
        res.status(201).json({
            message: "Orden de taller creada exitosamente",
            orden: result.rows[0],
        });
    } catch (error) {
        console.error("Error al crear orden:", error);
        res.status(500).json({ message: "Error al crear la orden de taller" });
    }
};

// Actualizar el estado de una orden
export const updateOrdenEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!estado) {
            return res.status(400).json({ message: "El campo 'estado' es requerido." });
        }

        const result = await pool.query(
            "UPDATE ordenes_taller SET estado = $1 WHERE id = $2 RETURNING *",
            [estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        res.status(200).json({
            message: "Estado de la orden actualizado exitosamente",
            orden: result.rows[0],
        });
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        res.status(500).json({ message: "Error al actualizar el estado de la orden" });
    }
};

// Eliminar una orden
export const deleteOrden = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM ordenes_taller WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }
        res.status(200).json({ message: "Orden eliminada exitosamente" });
    } catch (error) {
        console.error("Error al eliminar orden:", error);
        res.status(500).json({ message: "Error al eliminar la orden" });
    }
};