import { pool } from '../config/db.js';

const crearCliente = async (data) => {
  const { nombre, documento, telefono, email, empresa_id } = data;

  const query = `
    INSERT INTO clientes (nombre, documento, telefono, email, empresa_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [nombre, documento, telefono, email, empresa_id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const obtenerClientes = async (empresa_id) => {
  const query = `
    SELECT * FROM clientes
    WHERE empresa_id = $1
    ORDER BY created_at DESC;
  `;

  const { rows } = await pool.query(query, [empresa_id]);
  return rows;
};

export default {
  crearCliente,
  obtenerClientes
};
