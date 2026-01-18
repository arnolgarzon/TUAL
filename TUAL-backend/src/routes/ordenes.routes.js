import { Router } from 'express';
import OrdenesController from '../controllers/ordenes.controller.js';
import { verificarToken } from '../middleware/verificarToken.js';

const router = Router();

router.post('/', verificarToken, OrdenesController.crearOrden);
router.get('/', verificarToken, OrdenesController.listarOrdenesActivas);
router.put('/:id/estado', verificarToken, OrdenesController.cambiarEstado);

export default router;
