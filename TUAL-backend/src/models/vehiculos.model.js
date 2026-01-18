import { pool } from '../config/db.js';

const crearVehiculo = async (data) => {
  const { cliente_id, placa, marca, modelo, anio, color } = data;

  const query = `
    INSERT INTO vehiculos (cliente_id, placa, marca, modelo, anio, color)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [cliente_id, placa, marca, modelo, anio, color];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const obtenerVehiculosPorCliente = async (cliente_id) => {
  const query = `
    SELECT * FROM vehiculos
    WHERE cliente_id = $1
    ORDER BY created_at DESC;
  `;

  const { rows } = await pool.query(query, [cliente_id]);
  return rows;
};

export default {
  crearVehiculo,
  obtenerVehiculosPorCliente
};
