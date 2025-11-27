import { pool } from "../config/db.js";

// Obtener todas las empresas
export const getEmpresas = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM empresas");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener empresas:", err.message);
    res.status(500).json({ error: "Error interno al obtener empresas" });
  }
};

// Crear una nueva empresa
export const createEmpresa = async (req, res) => {
  const { nombre, direccion } = req.body;

  if (!nombre || !direccion) {
    return res.status(400).json({ error: "Nombre y dirección son requeridos" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO empresas (nombre, direccion) VALUES ($1, $2) RETURNING *",
      [nombre, direccion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error al crear empresa:", err.message);
    res.status(500).json({ error: "Error interno al crear empresa" });
  }
};