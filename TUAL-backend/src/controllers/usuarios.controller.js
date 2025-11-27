import { pool } from "../config/db.js"; // o como hayas llamado tu conexión

// ✅ Obtener todos los usuarios
export const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener los usuarios" });
  }
};

// ✅ Crear un nuevo usuario
export const createUsuario = async (req, res) => {
  try {
    const { nombre, correo, clave } = req.body;

    if (!nombre || !correo || !clave) {
      return res.status(400).json({ message: "Faltan datos del usuario" });
    }

    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, correo, clave) VALUES (?, ?, ?)",
      [nombre, correo, clave]
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      correo,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ message: "Error al crear el usuario" });
  }
};