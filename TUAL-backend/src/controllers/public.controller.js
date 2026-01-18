import bcrypt from "bcrypt";
import { pool } from "../config/db.js";

export const registroEmpresa = async (req, res) => {
  const client = await pool.connect();

  try {
    const { nombre, nit, email, password, rol } = req.body;

    if (!nombre || !nit || !email || !password) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    await client.query("BEGIN");

    // 1️⃣ Crear empresa
    const empresaResult = await client.query(
      `INSERT INTO empresas (nombre, nit, email)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [nombre, nit, email]
    );

    const empresaId = empresaResult.rows[0].id;

    // 2️⃣ Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3️⃣ Crear usuario admin
    await client.query(
      `INSERT INTO usuarios (nombre, email, password, rol, empresa_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        nombre,          // 👈 nombre del admin (temporal)
        email,
        passwordHash,
        rol || "ADMIN",
        empresaId
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Empresa y administrador creados correctamente",
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("❌ Error registro empresa:", error);

    res.status(500).json({
      message: "Error al registrar empresa",
    });
  } finally {
    client.release();
  }
};
