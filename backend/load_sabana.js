const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function loadCSV() {
    try {
        const filePath = path.join(__dirname, '..', 'SABANA_VENTAS_EJEMPLO.csv');
        console.log(`Leyendo archivo CSV: ${filePath}`);

        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        if (lines.length <= 1) {
            console.log('El archivo está vacío o solo tiene cabecera.');
            process.exit(0);
        }

        const headers = lines[0].split(',');
        console.log(`Encontrados ${lines.length - 1} registros para importar.`);

        let insertedCount = 0;

        for (let i = 1; i < lines.length; i++) {
            // Un split simple por comas (Asumiendo que no hay comas dentro de los campos string en el archivo de ejemplo)
            const row = lines[i].split(',');

            // Mapeo según la cabecera:
            // AÑO(0), MES(1), COD_POS(2), CR_TIENDA(3), COD_POSXPR(4), SKU(5), TIENDA(6), BARRA_EXTERNA(7), 
            // NOMBRE_PRO(8), UNIDADES_VE(9), PRECIO_BRUT(10), TOTAL_PRECIO_BRUTO(11), PRECIO_NETC(12), 
            // TOTAL_PRECIO_NETO(13), CANTIDAD_PF(14), PRECIO_PROM(15), YEAR_MONTH(16)

            const [
                anio, mes, codPos, crTienda, codPosxpr, sku, tienda, barraExterna,
                nombrePro, unidadesVe, precioBrut, totalPrecioBruto, precioNetc,
                totalPrecioNeto, cantidadPf, precioProm, yearMonth
            ] = row;

            await pool.query(
                `INSERT INTO VentasMensualesHistorico 
                (Anio, Mes, YearMonth, CodPos, CrTienda, Tienda, SKU, CodigoBarra, NombreProducto, 
                 UnidadesVendidas, PrecioBruto, TotalPrecioBruto, PrecioNeto, TotalPrecioNeto, 
                 CantidadPr, PrecioPromocional) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    parseInt(anio) || 0,
                    parseInt(mes) || 0,
                    yearMonth || '',
                    codPos || null,
                    crTienda || null,
                    tienda || null,
                    sku || '0',
                    barraExterna || null,
                    nombrePro || null,
                    parseFloat(unidadesVe) || 0,
                    parseFloat(precioBrut) || 0,
                    parseFloat(totalPrecioBruto) || 0,
                    parseFloat(precioNetc) || 0,
                    parseFloat(totalPrecioNeto) || 0,
                    parseFloat(cantidadPf) || 0,
                    parseFloat(precioProm) || 0
                ]
            );
            insertedCount++;
        }

        console.log(`✅ ¡Éxito! Se importaron ${insertedCount} registros de ventas históricos a la base de datos.`);
        process.exit(0);

    } catch (error) {
        console.error('Error durante la carga masiva:', error);
        process.exit(1);
    }
}

loadCSV();
