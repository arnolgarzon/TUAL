import { pool } from "../config/db.js";

// Obtener todas las empresas
export const obtenerEmpresas = async () => {
  const result = await pool.query("SELECT * FROM empresas ORDER BY id ASC");
  return result.rows;
};

// Crear una nueva empresa
export const crearEmpresa = async ({ nombre, nit, direccion, telefono }) => {
  const result = await pool.query(
    "INSERT INTO empresas (nombre, nit, direccion, telefono) VALUES ($1, $2, $3, $4) RETURNING *",
    [nombre, nit, direccion, telefono]
  );
  return result.rows[0];
};
