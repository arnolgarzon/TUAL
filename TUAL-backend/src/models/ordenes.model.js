import { pool } from '../config/db.js';

const crearOrden = async (data) => {
  const {
    cliente_id,
    vehiculo_id,
    usuario_responsable_id,
    empresa_id,
    descripcion_trabajo,
    total_estimado
  } = data;

  const query = `
    INSERT INTO ordenes_trabajo
    (cliente_id, vehiculo_id, usuario_responsable_id, empresa_id, descripcion_trabajo, total_estimado)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    cliente_id,
    vehiculo_id,
    usuario_responsable_id,
    empresa_id,
    descripcion_trabajo,
    total_estimado
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const cambiarEstadoOrden = async (id, estado) => {
  const query = `
    UPDATE ordenes_trabajo
    SET estado = $1
    WHERE id = $2
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [estado, id]);
  return rows[0];
};

const obtenerOrdenesActivas = async (empresa_id) => {
  const query = `
    SELECT * FROM ordenes_trabajo
    WHERE empresa_id = $1
      AND estado <> 'entregado'
    ORDER BY created_at DESC;
  `;

  const { rows } = await pool.query(query, [empresa_id]);
  return rows;
};

export default {
  crearOrden,
  cambiarEstadoOrden,
  obtenerOrdenesActivas
};
