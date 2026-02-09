// src/controllers/empresaUsuarios.controller.js
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

const saltRounds = 10;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const validatePasswordPolicy = (pwd) => {
  if (typeof pwd !== "string") return "La contraseña es inválida";
  if (pwd.length < 8) return "La contraseña debe tener mínimo 8 caracteres";
  if (!/\d/.test(pwd)) return "La contraseña debe contener al menos 1 número";
  return null;
};

const requireEmpresa = (req, res) => {
  const empresaId = req.user?.empresaId;
  if (!empresaId) {
    res.status(403).json({
      ok: false,
      message: "Tu usuario no tiene empresa asociada",
      code: "NO_EMPRESA",
    });
    return null;
  }
  return empresaId;
};

export const listarUsuariosEmpresa = async (req, res) => {
  try {
    const empresaId = requireEmpresa(req, res);
    if (!empresaId) return;

    const result = await pool.query(
      `
      SELECT id, nombre, email, rol, activo, fecha_registro, email_verificado, must_change_password
      FROM usuarios
      WHERE empresa_id = $1
      ORDER BY id DESC
      `,
      [empresaId]
    );

    return res.json({ ok: true, usuarios: result.rows });
  } catch (error) {
    console.error("❌ listarUsuariosEmpresa:", error);
    return res.status(500).json({ ok: false, message: "Error listando usuarios" });
  }
};

export const crearEmpleado = async (req, res) => {
  try {
    const empresaId = requireEmpresa(req, res);
    if (!empresaId) return;

    const nombre = String(req.body?.nombre || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    // Por defecto: SOLO empleados (recomendado para control)
    // Si más adelante quieres permitir crear "admin_empresa", lo habilitamos con una regla extra.
    const rolSolicitado = String(req.body?.rol || "").trim();
    const finalRol = rolSolicitado === "admin_empresa" ? "empleado" : "empleado";

    if (!nombre || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "nombre, email y password son obligatorios",
      });
    }

    const pwdErr = validatePasswordPolicy(password);
    if (pwdErr) {
      return res.status(400).json({ ok: false, message: pwdErr });
    }

    // Validar email único
    const existing = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ ok: false, message: "Ya existe un usuario con ese email" });
    }

    const hashed = await bcrypt.hash(password, saltRounds);

    // Empleados internos: email_verificado=true (no pedimos verificación)
    const result = await pool.query(
      `
      INSERT INTO usuarios (empresa_id, nombre, email, password, rol, activo, email_verificado, must_change_password)
      VALUES ($1, $2, $3, $4, $5, true, true, true)
      RETURNING id, empresa_id, nombre, email, rol, activo, email_verificado, must_change_password, fecha_registro
      `,
      [empresaId, nombre, email, hashed, finalRol]
    );

    return res.status(201).json({
      ok: true,
      message: "Empleado creado. Debe cambiar la contraseña al iniciar sesión.",
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error("❌ crearEmpleado:", error);
    return res.status(500).json({ ok: false, message: "Error creando empleado" });
  }
};

export const actualizarRolUsuario = async (req, res) => {
  try {
    const empresaId = requireEmpresa(req, res);
    if (!empresaId) return;

    const targetId = Number(req.params.id);
    const rol = String(req.body?.rol || "").trim();

    if (!targetId) {
      return res.status(400).json({ ok: false, message: "ID inválido" });
    }

    // Solo roles internos permitidos
    const allowedRoles = new Set(["empleado", "admin_empresa"]);
    if (!allowedRoles.has(rol)) {
      return res.status(400).json({ ok: false, message: "Rol inválido" });
    }

    // Evitar auto-cambio
    if (targetId === req.user.id) {
      return res.status(400).json({ ok: false, message: "No puedes cambiar tu propio rol aquí" });
    }

    // Evitar tocar superadmin por si acaso
    const targetCheck = await pool.query(
      `SELECT id, rol FROM usuarios WHERE id = $1 AND empresa_id = $2`,
      [targetId, empresaId]
    );
    if (targetCheck.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Usuario no encontrado en tu empresa" });
    }
    if (String(targetCheck.rows[0].rol).toLowerCase() === "superadmin") {
      return res.status(403).json({ ok: false, message: "Acción no permitida" });
    }

    const result = await pool.query(
      `
      UPDATE usuarios
      SET rol = $1
      WHERE id = $2 AND empresa_id = $3
      RETURNING id, nombre, email, rol, activo
      `,
      [rol, targetId, empresaId]
    );

    return res.json({ ok: true, usuario: result.rows[0] });
  } catch (error) {
    console.error("❌ actualizarRolUsuario:", error);
    return res.status(500).json({ ok: false, message: "Error actualizando rol" });
  }
};

export const activarDesactivarUsuario = async (req, res) => {
  try {
    const empresaId = requireEmpresa(req, res);
    if (!empresaId) return;

    const targetId = Number(req.params.id);
    const { activo } = req.body;

    if (!targetId || typeof activo !== "boolean") {
      return res.status(400).json({ ok: false, message: "Datos inválidos" });
    }

    if (targetId === req.user.id) {
      return res.status(400).json({ ok: false, message: "No puedes desactivarte a ti mismo" });
    }

    // Evitar tocar superadmin por si acaso
    const targetCheck = await pool.query(
      `SELECT id, rol FROM usuarios WHERE id = $1 AND empresa_id = $2`,
      [targetId, empresaId]
    );
    if (targetCheck.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Usuario no encontrado en tu empresa" });
    }
    if (String(targetCheck.rows[0].rol).toLowerCase() === "superadmin") {
      return res.status(403).json({ ok: false, message: "Acción no permitida" });
    }

    const result = await pool.query(
      `
      UPDATE usuarios
      SET activo = $1
      WHERE id = $2 AND empresa_id = $3
      RETURNING id, nombre, email, rol, activo
      `,
      [activo, targetId, empresaId]
    );

    return res.json({ ok: true, usuario: result.rows[0] });
  } catch (error) {
    console.error("❌ activarDesactivarUsuario:", error);
    return res.status(500).json({ ok: false, message: "Error actualizando estado" });
  }
};