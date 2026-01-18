import PagosModel from '../models/pagos.model.js';

const crearPago = async (req, res) => {
  try {
    const data = {
      ...req.body,
      usuario_id: req.user.id
    };

    const pago = await PagosModel.crearPago(data);
    res.status(201).json(pago);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar pago' });
  }
};

const listarPagosPorOrden = async (req, res) => {
  try {
    const { ordenId } = req.params;
    const pagos = await PagosModel.obtenerPagosPorOrden(ordenId);
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener pagos' });
  }
};

export default {
  crearPago,
  listarPagosPorOrden
};
