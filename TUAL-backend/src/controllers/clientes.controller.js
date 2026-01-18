import ClientesModel from '../models/clientes.model.js';

const crearCliente = async (req, res) => {
  try {
    const cliente = await ClientesModel.crearCliente(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear cliente' });
  }
};

const listarClientes = async (req, res) => {
  try {
    const { empresa_id } = req.user;
    const clientes = await ClientesModel.obtenerClientes(empresa_id);
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener clientes' });
  }
};

export default {
  crearCliente,
  listarClientes
};
