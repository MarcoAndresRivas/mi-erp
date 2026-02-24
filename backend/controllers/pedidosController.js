const pool = require('../config/db');

// @desc    Obtener pedidos asignados a un repartidor
// @route   GET /api/pedidos/repartidor
// @access  Privado (Solo Repartidor)
exports.getPedidosRepartidor = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const idEmpresa = req.usuario.idEmpresa;

        const [pedidos] = await pool.query(`
            SELECT 
                d.IdDespacho as id,
                COALESCE(d.ClienteNombre, 'Cliente General') as cliente,
                d.DireccionEntrega as direccion,
                d.EstadoEntrega as estado,
                d.FechaAsignacion as fecha,
                doc.Total as total
            FROM Despachos d
            JOIN Documentos doc ON d.IdVenta = doc.IdVenta
            WHERE d.IdRepartidor = ? AND doc.IdEmpresa = ?
            ORDER BY d.FechaAsignacion DESC
        `, [idUsuario, idEmpresa]);

        res.json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos del repartidor:', error);
        res.status(500).json({ message: 'Error en el servidor al cargar pedidos' });
    }
};

// @desc    Actualizar el estado de un pedido específico
// @route   PUT /api/pedidos/:id/estado
// @access  Privado (Solo Repartidor)
exports.updatePedidoEstado = async (req, res) => {
    try {
        const idDespacho = req.params.id;
        const idUsuario = req.usuario.id; // Confirmar que pertenece al repartidor
        const idEmpresa = req.usuario.idEmpresa;
        const { estado } = req.body;

        if (!estado) {
            return res.status(400).json({ message: 'El estado es requerido' });
        }

        // Validar que el despacho pertenece a este repartidor y a la empresa actual
        const [despCheck] = await pool.query(`
            SELECT d.IdDespacho 
            FROM Despachos d
            JOIN Documentos doc ON d.IdVenta = doc.IdVenta
            WHERE d.IdDespacho = ? AND d.IdRepartidor = ? AND doc.IdEmpresa = ?
        `, [idDespacho, idUsuario, idEmpresa]);

        if (despCheck.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado o acceso denegado' });
        }

        // Si el estado es entregado, actualizar la FechaEntrega
        let queryAct = 'UPDATE Despachos SET EstadoEntrega = ? WHERE IdDespacho = ?';
        if (estado === 'Entregado') {
            queryAct = 'UPDATE Despachos SET EstadoEntrega = ?, FechaEntrega = NOW() WHERE IdDespacho = ?';
        }

        await pool.query(queryAct, [estado, idDespacho]);

        res.json({ message: 'Estado del pedido actualizado exitosamente' });

    } catch (error) {
        console.error('Error al actualizar estado del pedido:', error);
        res.status(500).json({ message: 'Error en el servidor al actualizar el pedido' });
    }
};
