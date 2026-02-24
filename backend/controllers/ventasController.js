const pool = require('../config/db');

// @desc    Registrar una nueva venta
// @route   POST /api/ventas
// @access  Privado
exports.createVenta = async (req, res) => {
    let connection;
    try {
        const idEmpresa = req.usuario.idEmpresa;
        const idUsuario = req.usuario.id;
        const { cart, method, subtotal, tax, total } = req.body;

        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Insertar Documento Principal (Boleta/Factura)
        const [resultDoc] = await connection.query(`
            INSERT INTO Documentos (IdEmpresa, IdUsuarioCreador, TipoDocumento, SubTotal, Impuestos, Total, MetodoPago)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            idEmpresa,
            idUsuario,
            'Boleta', // Por defecto Boleta por ahora
            subtotal,
            tax,
            total,
            method || 'Efectivo'
        ]);

        const idVenta = resultDoc.insertId;

        // 2. Insertar Detalles de la Venta
        for (const item of cart) {
            await connection.query(`
                INSERT INTO DetalleDocumentos (IdVenta, IdProducto, Cantidad, PrecioUnitario, SubTotal)
                VALUES (?, ?, ?, ?, ?)
            `, [
                idVenta,
                item.id,
                item.cantidad,
                item.precioVenta,
                item.subtotal
            ]);

            // 3. Descontar Stock
            // Asumimos que se descuenta a la sucursal matriz o en general. Por ahora Stock no tiene sucursal en updateSchema pero en esquema original sí.
            // Primero verificamos si hay stock registrado
            const [stockRows] = await connection.query('SELECT Cantidad FROM Stock WHERE IdProducto = ?', [item.id]);

            if (stockRows.length > 0) {
                await connection.query('UPDATE Stock SET Cantidad = Cantidad - ? WHERE IdProducto = ?', [item.cantidad, item.id]);
            } else {
                // Si no hay registro de stock para el producto, creamos uno en negativo para mantener coherencia (aunque debiera existir)
                // Para una correcta implitación multi-sucursal faltaría el IdSucursal, 
                // pero lo simplificamos a IdProducto según esquema de "Stock" actual 
                // que es de relacion 1:1 en test_query.
                await connection.query('INSERT INTO Stock (IdProducto, Cantidad) VALUES (?, ?)', [item.id, -item.cantidad]);
            }
        }

        await connection.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Venta registrada con éxito',
            idVenta
        });

    } catch (error) {
        if (connection) {
            await connection.query('ROLLBACK');
        }
        console.error('Error al registrar venta:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor al procesar la venta' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// @desc    Obtener el historial de ventas
// @route   GET /api/ventas
// @access  Privado
exports.getVentas = async (req, res) => {
    try {
        const idEmpresa = req.usuario.idEmpresa;

        const [ventas] = await pool.query(`
            SELECT 
                d.IdVenta as id,
                d.TipoDocumento as tipoDocumento,
                d.Total as total,
                d.MetodoPago as metodoPago,
                d.FechaVenta as fecha,
                u.NombreCompleto as cajero
            FROM Documentos d
            LEFT JOIN Usuarios u ON d.IdUsuarioCreador = u.IdUsuario
            WHERE d.IdEmpresa = ?
            ORDER BY d.FechaVenta DESC
            LIMIT 100
        `, [idEmpresa]);

        res.json(ventas);
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ message: 'Error en el servidor al cargar el historial' });
    }
};

// @desc    Obtener el detalle de una venta
// @route   GET /api/ventas/:id
// @access  Privado
exports.getVentaDetalle = async (req, res) => {
    try {
        const idEmpresa = req.usuario.idEmpresa;
        const idVenta = req.params.id;

        // Primero verificamos que la venta exista y corresponda a la empresa
        const [docRows] = await pool.query('SELECT IdVenta FROM Documentos WHERE IdVenta = ? AND IdEmpresa = ?', [idVenta, idEmpresa]);
        if (docRows.length === 0) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        const [detalles] = await pool.query(`
            SELECT 
                dd.IdDetalle as id,
                p.Nombre as producto,
                dd.Cantidad as cantidad,
                dd.PrecioUnitario as precio,
                dd.SubTotal as subtotal
            FROM DetalleDocumentos dd
            JOIN Productos p ON dd.IdProducto = p.IdProducto
            WHERE dd.IdVenta = ?
        `, [idVenta]);

        res.json(detalles);
    } catch (error) {
        console.error('Error al obtener detalle de venta:', error);
        res.status(500).json({ message: 'Error en el servidor al cargar detalle de venta' });
    }
};
