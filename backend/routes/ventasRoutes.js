const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');
const { verifyToken } = require('../controllers/authMiddleware');

router.use(verifyToken); // Todas las rutas requieren autenticación

router.post('/', ventasController.createVenta);
router.get('/', ventasController.getVentas);
router.get('/:id', ventasController.getVentaDetalle);

module.exports = router;
