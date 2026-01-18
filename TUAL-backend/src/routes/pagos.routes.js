import { Router } from 'express';
import PagosController from '../controllers/pagos.controller.js';
import { verificarToken } from '../middleware/verificarToken.js';

const router = Router();

router.post('/', verificarToken, PagosController.crearPago);
router.get('/orden/:ordenId', verificarToken, PagosController.listarPagosPorOrden);

export default router;
