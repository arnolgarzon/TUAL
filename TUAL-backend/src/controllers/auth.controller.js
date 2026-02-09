// src/controllers/auth.controller.js
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

const saltRounds = 10;

/* =========================================================================
   HELPERS
======================================================================== */
const signToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      rol: usuario.rol,
      empresaId: usuario.empresa_id ?? null,
      nombre: usuario.nombre,
      email: usuario.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const generateCode6 = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const validatePasswordPolicy = (pwd) => {
  if (typeof pwd !== "string") return "La contraseña es inválida";
  if (pwd.length < 8) return "Mínimo 8 caracteres";
  if (!/\d/.test(pwd)) return "Debe contener al menos un número";
  return null;
};

/* =========================================================================
   REGISTER
======================================================================== */
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ ok: false, details: errors.array() });
    }

    const { nombre, email, password } = req.body;

    const pwdErr = validatePasswordPolicy(password);
    if (pwdErr) return res.status(400).json({ ok: false, error: pwdErr });

    const exists = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );
    if (exists.rows.length) {
      return res.status(409).json({ ok: false, error: "Email ya registrado" });
    }

    const hash = await bcrypt.hash(password, saltRounds);

    const { rows } = await pool.query(
      `
      INSERT INTO usuarios (nombre, email, password, rol, email_verificado)
      VALUES ($1, $2, $3, 'empleado', true)
      RETURNING id, nombre, email, rol, empresa_id, activo, email_verificado
      `,
      [nombre, email, hash]
    );

    const token = signToken(rows[0]);

    res.status(201).json({ ok: true, token, usuario: rows[0] });
  } catch (err) {
    console.error("❌ register:", err);
    res.status(500).json({ ok: false, error: "Error en registro" });
  }
};

/* =========================================================================
   LOGIN
======================================================================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT * FROM usuarios WHERE email = $1`,
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ ok: false, error: "Credenciales inválidas" });
    }

    const user = result.rows[0];

    if (!user.email_verificado) {
      return res.status(403).json({ ok: false, error: "Email no verificado" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ ok: false, error: "Credenciales inválidas" });
    }

    const token = signToken(user);

    res.json({
      ok: true,
      token,
      mustChangePassword: user.must_change_password === true,
      usuario: user,
    });
  } catch (err) {
    console.error("❌ login:", err);
    res.status(500).json({ ok: false, error: "Error en login" });
  }
};

/* =========================================================================
   VERIFY EMAIL
======================================================================== */
export const verifyEmailCode = async (req, res) => {
  const { email, code } = req.body;

  const result = await pool.query(
    `
    SELECT id, email_verification_code, email_verification_expires
    FROM usuarios WHERE email = $1
    `,
    [email]
  );

  if (!result.rows.length) {
    return res.status(404).json({ ok: false, error: "Usuario no encontrado" });
  }

  const u = result.rows[0];

  if (
    String(code) !== String(u.email_verification_code) ||
    Date.now() > new Date(u.email_verification_expires).getTime()
  ) {
    return res.status(400).json({ ok: false, error: "Código inválido o expirado" });
  }

  await pool.query(
    `
    UPDATE usuarios
    SET email_verificado = true,
        email_verification_code = NULL,
        email_verification_expires = NULL
    WHERE id = $1
    `,
    [u.id]
  );

  res.json({ ok: true, message: "Correo verificado" });
};

/* =========================================================================
   RESEND VERIFICATION CODE  ✅ (ESTE FALTABA)
======================================================================== */
export const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  const result = await pool.query(
    `SELECT id, email_verificado FROM usuarios WHERE email = $1`,
    [email]
  );

  if (!result.rows.length) {
    return res.status(404).json({ ok: false, error: "Usuario no encontrado" });
  }

  if (result.rows[0].email_verificado) {
    return res.json({ ok: true, message: "Correo ya verificado" });
  }

  const code = generateCode6();
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await pool.query(
    `
    UPDATE usuarios
    SET email_verification_code = $1,
        email_verification_expires = $2
    WHERE email = $3
    `,
    [code, expires, email]
  );

  console.log(`📧 [DEV] Código verificación ${email}: ${code}`);

  res.json({ ok: true, message: "Código reenviado" });
};

/* =========================================================================
   FORGOT PASSWORD  ✅
======================================================================== */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const result = await pool.query(
    `SELECT id FROM usuarios WHERE email = $1`,
    [email]
  );

  if (!result.rows.length) {
    return res.json({ ok: true, message: "Si existe, recibirás un código" });
  }

  const code = generateCode6();
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await pool.query(
    `
    UPDATE usuarios
    SET reset_password_code = $1,
        reset_password_expires = $2
    WHERE email = $3
    `,
    [code, expires, email]
  );

  console.log(`🔐 [DEV] Reset password ${email}: ${code}`);

  res.json({ ok: true, message: "Código enviado" });
};

/* =========================================================================
   RESET PASSWORD  ✅
======================================================================== */
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  const pwdErr = validatePasswordPolicy(newPassword);
  if (pwdErr) return res.status(400).json({ ok: false, error: pwdErr });

  const result = await pool.query(
    `
    SELECT id, reset_password_code, reset_password_expires
    FROM usuarios WHERE email = $1
    `,
    [email]
  );

  if (
    !result.rows.length ||
    String(code) !== String(result.rows[0].reset_password_code) ||
    Date.now() > new Date(result.rows[0].reset_password_expires).getTime()
  ) {
    return res.status(400).json({ ok: false, error: "Código inválido o expirado" });
  }

  const hash = await bcrypt.hash(newPassword, saltRounds);

  await pool.query(
    `
    UPDATE usuarios
    SET password = $1,
        reset_password_code = NULL,
        reset_password_expires = NULL
    WHERE id = $2
    `,
    [hash, result.rows[0].id]
  );

  res.json({ ok: true, message: "Contraseña restablecida" });
};

/* =========================================================================
   CHANGE PASSWORD
======================================================================== */
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  const pwdErr = validatePasswordPolicy(newPassword);
  if (pwdErr) return res.status(400).json({ ok: false, error: pwdErr });

  const result = await pool.query(
    `SELECT password FROM usuarios WHERE id = $1`,
    [userId]
  );

  const ok = await bcrypt.compare(currentPassword, result.rows[0].password);
  if (!ok) {
    return res.status(401).json({ ok: false, error: "Contraseña incorrecta" });
  }

  const hash = await bcrypt.hash(newPassword, saltRounds);

  await pool.query(
    `UPDATE usuarios SET password = $1 WHERE id = $2`,
    [hash, userId]
  );

  res.json({ ok: true, message: "Contraseña actualizada" });
};
