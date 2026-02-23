const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const { verifyToken, requireRole } = require('../controllers/authMiddleware');

// Todas las rutas de productos requieren estar autenticado
router.use(verifyToken);

// ==========================================
// Rutas Públicas (Lectura) para Empleados
// ==========================================
// Administrador, Vendedor y Cajero pueden ver productos (Cajero para el POS)
router.get('/', requireRole(['Administrador', 'Vendedor', 'Cajero']), productosController.getProductos);

// ==========================================
// Rutas Protegidas (Escritura) para Admin
// ==========================================
// Crear Producto
router.post('/', requireRole(['Administrador']), productosController.createProducto);

// Editar Producto
router.put('/:id', requireRole(['Administrador']), productosController.updateProducto);

// Eliminar (Desactivar) Producto
router.delete('/:id', requireRole(['Administrador']), productosController.deleteProducto);

module.exports = router;
