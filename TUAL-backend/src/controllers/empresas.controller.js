import { pool } from "../config/db.js";

// Listar empresas
export const getEmpresas = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM empresas");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener empresas" });
  }
};

// Crear empresa
export const createEmpresa = async (req, res) => {
  try {
    const { nombre, nit, direccion, telefono } = req.body;

    const result = await pool.query(
      "INSERT INTO empresas (nombre, nit, direccion, telefono) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, nit, direccion, telefono]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear empresa" });
  }
};

// Actualizar empresa
export const updateEmpresa = async (req, res) => {
  try {
    const { id } = req.params;

    const { nombre, nit, direccion, telefono } = req.body;

    const result = await pool.query(
      "UPDATE empresas SET nombre=$1, nit=$2, direccion=$3, telefono=$4 WHERE id=$5 RETURNING *",
      [nombre, nit, direccion, telefono, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar empresa" });
  }
};

// Eliminar empresa
export const deleteEmpresa = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM empresas WHERE id=$1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    res.json({ message: "Empresa eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar empresa" });
  }
};
