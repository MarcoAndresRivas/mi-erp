const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function loadProducts() {
    try {
        const filePath = path.join(__dirname, '..', 'SABANA_VENTAS_EJEMPLO.csv');
        console.log(`Leyendo archivo CSV: ${filePath}`);

        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        if (lines.length <= 1) {
            console.log('El archivo está vacío o solo tiene cabecera.');
            process.exit(0);
        }

        console.log(`Encontrados ${lines.length - 1} registros para importar a Productos.`);

        let insertedCount = 0;
        const idEmpresa = 1; // Asumiendo Empresa 1 "Mi Supermercado"

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');

            // AÑO(0), MES(1), COD_POS(2), CR_TIENDA(3), COD_POSXPR(4), SKU(5), TIENDA(6), BARRA_EXTERNA(7), 
            // NOMBRE_PRO(8), UNIDADES_VE(9), PRECIO_BRUT(10), TOTAL_PRECIO_BRUTO(11), PRECIO_NETC(12), 
            // TOTAL_PRECIO_NETO(13), CANTIDAD_PF(14), PRECIO_PROM(15), YEAR_MONTH(16)

            const [
                anio, mes, codPos, crTienda, codPosxpr, sku, tienda, barraExterna,
                nombrePro, unidadesVe, precioBrut, totalPrecioBruto, precioNetc,
                totalPrecioNeto, cantidadPf, precioProm, yearMonth
            ] = row;

            // Revisar si existe
            const [exist] = await pool.query('SELECT IdProducto FROM Productos WHERE Nombre = ? AND IdEmpresa = ?', [nombrePro, idEmpresa]);

            if (exist.length === 0) {
                // Insertar a Productos
                // p.IdProducto as id, p.SKU as sku, p.CodigoBarras as codigoBarras, p.Nombre as nombre, 
                // p.PrecioVenta as precioVenta, p.PrecioNeto as precioNeto, p.Costo as costo
                const [res] = await pool.query(
                    `INSERT INTO Productos 
                    (IdEmpresa, SKU, CodigoBarras, Nombre, PrecioVenta, PrecioNeto, Costo) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        idEmpresa,
                        sku || null,
                        barraExterna || null,
                        nombrePro || 'Producto Desconocido',
                        parseFloat(precioBrut) || 0,
                        parseFloat(precioNetc) || 0,
                        parseFloat(precioProm) || 0
                    ]
                );

                // Insertar stock
                const idProducto = res.insertId;
                await pool.query(
                    'INSERT INTO Stock (IdProducto, Cantidad, FechaUltimaActualizacion) VALUES (?, ?, NOW())',
                    [idProducto, parseFloat(unidadesVe) || 10]
                );

                insertedCount++;
            }
        }

        console.log(`✅ ¡Éxito! Se importaron ${insertedCount} productos al catálogo.`);
        process.exit(0);

    } catch (error) {
        console.error('Error durante la carga de productos:', error);
        process.exit(1);
    }
}

loadProducts();
