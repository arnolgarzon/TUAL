import { Router } from 'express';
import VehiculosController from '../controllers/vehiculos.controller.js';
import { verificarToken } from '../middleware/verificarToken.js';

const router = Router();

router.post('/', verificarToken, VehiculosController.crearVehiculo);
router.get('/cliente/:clienteId', verificarToken, VehiculosController.listarVehiculosPorCliente);

export default router;
