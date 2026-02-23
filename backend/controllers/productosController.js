const pool = require('../config/db');

// @desc    Obtener todos los productos de la empresa
// @route   GET /api/productos
// @access  Privado (Vendedor, Cajero, Admin)
exports.getProductos = async (req, res) => {
    try {
        const idEmpresa = req.usuario.idEmpresa;

        // Se usa JOIN con Stock para obtener inventario real, simulando el modelo propuesto
        const [productos] = await pool.query(`
            SELECT 
                p.IdProducto as id,
                p.SKU as sku,
                p.CodigoBarras as codigoBarras,
                p.Nombre as nombre,
                p.PrecioVenta as precioVenta,
                p.PrecioNeto as precioNeto,
                p.PrecioCosto as costo,
                COALESCE(s.Cantidad, 0) as stockActual,
                c.NombreCategoria as categoria
            FROM Productos p
            LEFT JOIN Stock s ON p.IdProducto = s.IdProducto
            LEFT JOIN Categorias c ON p.IdCategoria = c.IdCategoria
            WHERE p.IdEmpresa = ? AND p.Activo = 1
        `, [idEmpresa]);

        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error en el servidor al cargar productos' });
    }
};

// @desc    Crear un nuevo producto
// @route   POST /api/productos
// @access  Privado (Solo Admin)
exports.createProducto = async (req, res) => {
    try {
        const idEmpresa = req.usuario.idEmpresa;
        const { sku, nombre, codigoBarras, precioVenta, precioNeto, precioCosto, categoria, stockInicial } = req.body;

        // Validaciones básicas
        if (!nombre || !precioVenta) {
            return res.status(400).json({ message: 'Nombre y Precio de Venta son obligatorios' });
        }

        // 1. Manejar Categoria (Asumiendo que si no existe 'Sin Categoria', podríamos mandarla NULL o crearla)
        // Por simplicidad, asignaremos NULL si no enviamos un ID de categoría o crearla bajo demanda si es un string.
        let idCategoria = null;
        if (categoria) {
            // Buscar categoria por nombre
            const [catResult] = await pool.query('SELECT IdCategoria FROM Categorias WHERE NombreCategoria = ? AND IdEmpresa = ?', [categoria, idEmpresa]);
            if (catResult.length > 0) {
                idCategoria = catResult[0].IdCategoria;
            } else {
                // Crear nueva categoria si no existe
                const [newCat] = await pool.query('INSERT INTO Categorias (IdEmpresa, NombreCategoria) VALUES (?, ?)', [idEmpresa, categoria]);
                idCategoria = newCat.insertId;
            }
        }

        // 2. Insertar Producto
        const [resultProd] = await pool.query(
            'INSERT INTO Productos (IdEmpresa, SKU, CodigoBarras, Nombre, PrecioVenta, PrecioNeto, PrecioCosto, IdCategoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [idEmpresa, sku || null, codigoBarras || null, nombre, precioVenta, precioNeto || null, precioCosto || 0, idCategoria]
        );

        const idNuevoProducto = resultProd.insertId;

        // 3. Registrar Stock Inicial (Si el usuario envió un número superior a 0)
        if (stockInicial && parseInt(stockInicial) > 0) {
            // Asignamos a una Sucursal = 1 por defecto (simplificación para el MVP)
            const [sucursales] = await pool.query('SELECT IdSucursal FROM Sucursales WHERE IdEmpresa = ? LIMIT 1', [idEmpresa]);
            let idSucursalDestino;

            if (sucursales.length > 0) {
                idSucursalDestino = sucursales[0].IdSucursal;
            } else {
                // Crear sucursal matriz si no existe
                const [newSucursal] = await pool.query('INSERT INTO Sucursales (IdEmpresa, NombreSucursal) VALUES (?, ?)', [idEmpresa, 'Casa Matriz']);
                idSucursalDestino = newSucursal.insertId;
            }

            await pool.query(
                'INSERT INTO Stock (IdProducto, IdSucursal, Cantidad, FechaUltimaActualizacion) VALUES (?, ?, ?, NOW())',
                [idNuevoProducto, idSucursalDestino, stockInicial]
            );
        }

        res.status(201).json({
            message: 'Producto creado exitosamente',
            productoId: idNuevoProducto
        });

    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ message: 'Error en el servidor al registrar el producto' });
    }
};

// @desc    Actualizar un producto (Ej: Modificar Precio)
// @route   PUT /api/productos/:id
// @access  Privado (Solo Admin)
exports.updateProducto = async (req, res) => {
    try {
        const idEmpresa = req.usuario.idEmpresa;
        const { id } = req.params;
        const { sku, nombre, codigoBarras, precioVenta, precioNeto, precioCosto } = req.body;

        // Verificar que el producto pertenece a la empresa
        const [prodCheck] = await pool.query('SELECT IdProducto FROM Productos WHERE IdProducto = ? AND IdEmpresa = ?', [id, idEmpresa]);
        if (prodCheck.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado o denegado' });
        }

        await pool.query(
            'UPDATE Productos SET SKU = ?, Nombre = ?, CodigoBarras = ?, PrecioVenta = ?, PrecioNeto = ?, PrecioCosto = ? WHERE IdProducto = ?',
            [sku, nombre, codigoBarras, precioVenta, precioNeto, precioCosto, id]
        );

        res.json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ message: 'Error en el servidor al actualizar el producto' });
    }
};

// @desc    Eliminar (Desactivar) lógico de un producto
// @route   DELETE /api/productos/:id
// @access  Privado (Solo Admin)
exports.deleteProducto = async (req, res) => {
    try {
        const idEmpresa = req.usuario.idEmpresa;
        const { id } = req.params;

        await pool.query('UPDATE Productos SET Activo = 0 WHERE IdProducto = ? AND IdEmpresa = ?', [id, idEmpresa]);

        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ message: 'Error en el servidor al eliminar (desactivar) el producto' });
    }
};
