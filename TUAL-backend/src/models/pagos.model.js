import { pool } from '../config/db.js';

const crearPago = async (data) => {
  const { orden_id, monto, metodo_pago, estado_pago, usuario_id } = data;

  const query = `
    INSERT INTO pagos (orden_id, monto, metodo_pago, estado_pago, usuario_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [orden_id, monto, metodo_pago, estado_pago, usuario_id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const obtenerPagosPorOrden = async (orden_id) => {
  const query = `
    SELECT * FROM pagos
    WHERE orden_id = $1
    ORDER BY created_at ASC;
  `;

  const { rows } = await pool.query(query, [orden_id]);
  return rows;
};

export default {
  crearPago,
  obtenerPagosPorOrden
};
