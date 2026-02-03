// src/controllers/clientes.controller.js
import ClientesModel from "../models/clientes.model.js";

const crearCliente = async (req, res) => {
  try {
    // empresaId sale del token, NO del body
    const empresaId = req.user?.empresaId;
    if (!empresaId) {
      return res.status(400).json({ mensaje: "El usuario no tiene empresa asignada." });
    }

    const cliente = await ClientesModel.crearCliente({
      ...req.body,
      empresa_id: empresaId, // el model usa columna empresa_id (BD)
    });

    return res.status(201).json(cliente);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error al crear cliente" });
  }
};

const listarClientes = async (req, res) => {
  try {
    const empresaId = req.user?.empresaId;
    if (!empresaId) {
      return res.status(400).json({ mensaje: "El usuario no tiene empresa asignada." });
    }

    const clientes = await ClientesModel.obtenerClientes(empresaId);
    return res.json(clientes);
  } catch (error) {
    return res.status(500).json({ mensaje: "Error al obtener clientes" });
  }
};

export default {
  crearCliente,
  listarClientes,
};