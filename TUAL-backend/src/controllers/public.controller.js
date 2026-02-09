import bcrypt from "bcrypt";
import { pool } from "../config/db.js";

const generateCode6 = () => String(Math.floor(100000 + Math.random() * 900000));

export const registroEmpresa = async (req, res) => {
  const client = await pool.connect();

  try {
    const { nombre, nit, email, password } = req.body;

    if (!nombre || !nit || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    await client.query("BEGIN");

    // 0) Verificar email existente
    const existing = await client.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Ya existe un usuario con este email" });
    }

    // 1) Crear empresa
    const empresaResult = await client.query(
      `INSERT INTO empresas (nombre, nit, email)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [nombre, nit, email]
    );

    const empresaId = empresaResult.rows[0].id;

    // 2) Crear admin_empresa con verificación pendiente
    const passwordHash = await bcrypt.hash(password, 10);

    const code = generateCode6();
    const expires = new Date(Date.now() + 20 * 60 * 1000); // 20 min

    await client.query(
      `INSERT INTO usuarios (nombre, email, password, rol, empresa_id, email_verificado, email_verification_code, email_verification_expires)
       VALUES ($1, $2, $3, $4, $5, false, $6, $7)`,
      [
        "Administrador",  // si quieres, luego pedimos nombre admin en el form
        email,
        passwordHash,
        "admin_empresa",
        empresaId,
        code,
        expires,
      ]
    );

    await client.query(
  `
  INSERT INTO empresa_modulos (empresa_id, modulo, enabled)
  VALUES 
    ($1, 'clientes', true),
    ($1, 'vehiculos', true),
    ($1, 'ordenes', true),
    ($1, 'pagos', true),
    ($1, 'reportes', true)
  ON CONFLICT (empresa_id, modulo) DO NOTHING
  `,
  [empresaId]
);

await client.query(
  `
  INSERT INTO empresa_rol_permisos (empresa_id, rol, permiso_clave)
  VALUES
    ($1, 'admin_empresa', 'clientes:read'),
    ($1, 'admin_empresa', 'clientes:write'),
    ($1, 'empleado', 'clientes:read')
  ON CONFLICT (empresa_id, rol, permiso_clave) DO NOTHING
  `,
  [empresaId]
);

    await client.query("COMMIT");

    const response = {
      message:
        "Empresa y administrador creados. Revisa tu correo para verificar tu cuenta antes de iniciar sesión.",
    };

    // DEV: simular correo
    if (process.env.NODE_ENV !== "production") {
      response.dev_verification_code = code;
      console.log(`📧 [DEV] Código verificación para ${email}: ${code}`);
    }

    return res.status(201).json(response);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error registro empresa:", error);
    return res.status(500).json({ message: "Error al registrar empresa" });
  } finally {
    client.release();
  }
};