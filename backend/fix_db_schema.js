const pool = require('./config/db');

async function fixSchema() {
    try {
        console.log("Checking DB schema for missing tables...");

        // Create Categorias table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Categorias (
                IdCategoria INT AUTO_INCREMENT PRIMARY KEY,
                IdEmpresa INT NOT NULL,
                NombreCategoria VARCHAR(100) NOT NULL,
                FOREIGN KEY (IdEmpresa) REFERENCES Empresas(IdEmpresa)
            )
        `);
        console.log("Categorias table ensured.");

        // Create Sucursales table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Sucursales (
                IdSucursal INT AUTO_INCREMENT PRIMARY KEY,
                IdEmpresa INT NOT NULL,
                NombreSucursal VARCHAR(100) NOT NULL,
                Direccion VARCHAR(250) NULL,
                FOREIGN KEY (IdEmpresa) REFERENCES Empresas(IdEmpresa)
            )
        `);
        console.log("Sucursales table ensured.");

        // Alter Productos table to add IdCategoria if it doesn't exist
        try {
            await pool.query(`
                ALTER TABLE Productos
                ADD COLUMN IdCategoria INT NULL,
                ADD FOREIGN KEY (IdCategoria) REFERENCES Categorias(IdCategoria)
            `);
            console.log("IdCategoria column added to Productos.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("Column IdCategoria already exists in Productos.");
            } else {
                console.error("Error altering Productos:", e);
            }
        }

        // Alter Stock table to add IdSucursal if it doesn't exist
        try {
            await pool.query(`
                ALTER TABLE Stock
                ADD COLUMN IdSucursal INT NULL,
                ADD FOREIGN KEY (IdSucursal) REFERENCES Sucursales(IdSucursal)
            `);
            console.log("IdSucursal column added to Stock.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("Column IdSucursal already exists in Stock.");
            } else {
                console.error("Error altering Stock:", e);
            }
        }

        console.log("Schema fixed successfully.");
        process.exit(0);
    } catch (e) {
        console.error("Error fixing schema:", e);
        process.exit(1);
    }
}

fixSchema();
