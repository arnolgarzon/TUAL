import { Router } from 'express';
import ClientesController from '../controllers/clientes.controller.js';
import { verificarToken } from '../middleware/verificarToken.js';

const router = Router();

router.post('/', verificarToken, ClientesController.crearCliente);
router.get('/', verificarToken, ClientesController.listarClientes);

export default router;
