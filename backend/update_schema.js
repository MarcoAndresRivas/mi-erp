const pool = require('./config/db');

async function updateSchema() {
    try {
        console.log('Agregando columnas necesarias a Productos...');

        // Agregar columna SKU si no existe
        try {
            await pool.query('ALTER TABLE Productos ADD COLUMN SKU VARCHAR(50) NULL AFTER IdEmpresa');
            console.log('✅ Columna SKU agregada');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Columna SKU ya existe');
            } else {
                throw e;
            }
        }

        // Agregar columna PrecioNeto si no existe
        try {
            await pool.query('ALTER TABLE Productos ADD COLUMN PrecioNeto DECIMAL(18,2) NULL AFTER PrecioVenta');
            console.log('✅ Columna PrecioNeto agregada');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Columna PrecioNeto ya existe');
            } else {
                throw e;
            }
        }

        console.log('🎉 Migración finalizada.');
        process.exit(0);
    } catch (error) {
        console.error('Error actualizando esquema:', error);
        process.exit(1);
    }
}

updateSchema();
