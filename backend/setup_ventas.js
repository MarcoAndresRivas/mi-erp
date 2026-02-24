const pool = require('./config/db');

async function setupVentas() {
    try {
        console.log('Verificando y creando tablas para Ventas...');

        // 1. Tabla Documentos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Documentos (
                IdVenta INT AUTO_INCREMENT PRIMARY KEY,
                IdEmpresa INT NOT NULL,
                IdUsuarioCreador INT NOT NULL,
                TipoDocumento VARCHAR(20) NOT NULL, -- 'Boleta', 'Factura', 'NotaCredito'
                SubTotal DECIMAL(18,2) NOT NULL,
                Impuestos DECIMAL(18,2) NOT NULL,
                Total DECIMAL(18,2) NOT NULL,
                MetodoPago VARCHAR(50) NOT NULL, -- 'Efectivo', 'Tarjeta', 'Transferencia'
                FechaVenta DATETIME DEFAULT CURRENT_TIMESTAMP,
                Observaciones TEXT NULL,
                FOREIGN KEY (IdEmpresa) REFERENCES Empresas(IdEmpresa),
                FOREIGN KEY (IdUsuarioCreador) REFERENCES Usuarios(IdUsuario)
            );
        `);
        console.log('✅ Tabla Documentos verificada/creada');

        // 2. Tabla DetalleDocumentos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS DetalleDocumentos (
                IdDetalle INT AUTO_INCREMENT PRIMARY KEY,
                IdVenta INT NOT NULL,
                IdProducto INT NOT NULL,
                Cantidad DECIMAL(18,2) NOT NULL,
                PrecioUnitario DECIMAL(18,2) NOT NULL,
                SubTotal DECIMAL(18,2) NOT NULL,
                FOREIGN KEY (IdVenta) REFERENCES Documentos(IdVenta) ON DELETE CASCADE,
                FOREIGN KEY (IdProducto) REFERENCES Productos(IdProducto)
            );
        `);
        console.log('✅ Tabla DetalleDocumentos verificada/creada');

        console.log('🎉 Migración de ventas finalizada correctamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error configurando tablas de ventas:', error);
        process.exit(1);
    }
}

setupVentas();
