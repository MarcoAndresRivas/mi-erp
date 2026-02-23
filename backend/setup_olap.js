const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function deployOlap() {
    try {
        console.log('Desplegando tabla Analítica...');
        const sqlPath = 'C:\\Users\\PC RST\\.gemini\\antigravity\\brain\\8fff8181-3866-4f5b-8f10-fee14f47c6fc\\olap_schema_ventas.sql';
        const fileContent = fs.readFileSync(sqlPath, 'utf8');

        // Extraer y ejecutar solo el comando CREATE TABLE
        const startIdx = fileContent.indexOf('CREATE TABLE');
        if (startIdx !== -1) {
            const createQuery = fileContent.substring(startIdx);
            await pool.query(createQuery);
            console.log('✅ Tabla VentasMensualesHistorico desplegada exitosamente (OLAP)');
        }
    } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('✅ La tabla VentasMensualesHistorico ya estaba desplegada.');
        } else {
            console.error('Error desplegando OLAP Schema:', error);
            process.exit(1);
        }
    }
    process.exit(0);
}

deployOlap();
