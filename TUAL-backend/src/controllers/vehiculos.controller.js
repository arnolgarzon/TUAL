import VehiculosModel from '../models/vehiculos.model.js';

const crearVehiculo = async (req, res) => {
  try {
    const vehiculo = await VehiculosModel.crearVehiculo(req.body);
    res.status(201).json(vehiculo);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear vehículo' });
  }
};

const listarVehiculosPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const vehiculos = await VehiculosModel.obtenerVehiculosPorCliente(clienteId);
    res.json(vehiculos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener vehículos' });
  }
};

export default {
  crearVehiculo,
  listarVehiculosPorCliente
};
