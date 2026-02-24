const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');
const { verifyToken, requireRole } = require('../controllers/authMiddleware');

router.use(verifyToken); // Todas las rutas requieren autenticación

// Solo repartidores y admin deberían ver esto idealmente
router.get('/repartidor', requireRole(['Repartidor', 'Administrador']), pedidosController.getPedidosRepartidor);
router.put('/:id/estado', requireRole(['Repartidor', 'Administrador']), pedidosController.updatePedidoEstado);

module.exports = router;
