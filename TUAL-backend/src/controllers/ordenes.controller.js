import OrdenesModel from '../models/ordenes.model.js';

const crearOrden = async (req, res) => {
  try {
    const data = {
      ...req.body,
      empresa_id: req.user.empresa_id,
      usuario_responsable_id: req.user.id
    };

    const orden = await OrdenesModel.crearOrden(data);
    res.status(201).json(orden);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear orden' });
  }
};

const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const orden = await OrdenesModel.cambiarEstadoOrden(id, estado);
    res.json(orden);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar estado' });
  }
};

const listarOrdenesActivas = async (req, res) => {
  try {
    const { empresa_id } = req.user;
    const ordenes = await OrdenesModel.obtenerOrdenesActivas(empresa_id);
    res.json(ordenes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener órdenes' });
  }
};

export default {
  crearOrden,
  cambiarEstado,
  listarOrdenesActivas
};
