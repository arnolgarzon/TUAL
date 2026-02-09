// src/controllers/clientes.controller.js
import ClientesModel from "../models/clientes.model.js";

/**
 * Helpers internos
 */
const getEmpresaIdOrFail = (req, res) => {
  const empresaId = req.user?.empresaId ?? null;

  // superadmin no debería usar este controller (normalmente)
  // pero si llega aquí sin empresaId, devolvemos error claro.
  if (!empresaId) {
    res.status(400).json({
      ok: false,
      message: "El usuario no tiene empresa asignada.",
      code: "NO_EMPRESA",
    });
    return null;
  }

  return empresaId;
};

const sanitizeClienteInput = (body = {}) => {
  // Ajusta estos campos según tu formulario/BD real
  // Importante: NO aceptamos empresa_id desde el body (multi-tenant seguro)
  const {
    empresa_id, // se ignora
    empresaId,  // se ignora
    id,         // se ignora
    created_at, // se ignora
    updated_at, // se ignora
    ...rest
  } = body;

  return rest;
};

/**
 * POST /api/clientes
 * Crea cliente dentro de la empresa del token
 */
const crearCliente = async (req, res) => {
  try {
    const empresaId = getEmpresaIdOrFail(req, res);
    if (!empresaId) return;

    const payload = sanitizeClienteInput(req.body);

    const cliente = await ClientesModel.crearCliente({
      ...payload,
      empresa_id: empresaId, // el model usa columna empresa_id (BD)
    });

    return res.status(201).json({
      ok: true,
      cliente,
    });
  } catch (error) {
    console.error("crearCliente error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al crear cliente",
      code: "CLIENTE_CREATE_FAILED",
    });
  }
};

/**
 * GET /api/clientes
 * Lista clientes de la empresa del token
 */
const listarClientes = async (req, res) => {
  try {
    const empresaId = getEmpresaIdOrFail(req, res);
    if (!empresaId) return;

    const clientes = await ClientesModel.obtenerClientes(empresaId);

    return res.json({
      ok: true,
      clientes,
      count: Array.isArray(clientes) ? clientes.length : 0,
    });
  } catch (error) {
    console.error("listarClientes error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener clientes",
      code: "CLIENTE_LIST_FAILED",
    });
  }
};

export default {
  crearCliente,
  listarClientes,
};

// Export opcional por si prefieres imports named en rutas
export { crearCliente, listarClientes };