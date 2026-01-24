// src/services/superadmin.service.js
import { pool } from "../config/db.js";

export const getDashboardMetrics = async () => {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM empresas) AS total_empresas,
      (SELECT COUNT(*) FROM empresas WHERE activa = true) AS empresas_activas,
      (SELECT COUNT(*) FROM usuarios) AS total_usuarios,
      (SELECT COUNT(*) FROM usuarios WHERE activo = true) AS usuarios_activos
  `);

  return rows[0];
};
