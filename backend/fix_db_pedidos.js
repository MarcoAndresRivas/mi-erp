const pool = require('./config/db');

async function fixDespachos() {
    try {
        console.log("Checking DB schema for Despachos table adjustments...");

        // Alter Despachos table to add ClienteNombre if it doesn't exist
        try {
            await pool.query(`
                ALTER TABLE Despachos
                ADD COLUMN ClienteNombre VARCHAR(150) NULL
            `);
            console.log("ClienteNombre column added to Despachos.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("Column ClienteNombre already exists in Despachos.");
            } else {
                console.error("Error altering Despachos:", e);
                throw e;
            }
        }

        // Insert a dummy user driver (Repartidor) if not exists
        let driverId = null;
        const [drivers] = await pool.query(`SELECT IdUsuario FROM Usuarios WHERE Email = 'driver@mierp.com'`);
        if (drivers.length > 0) {
            driverId = drivers[0].IdUsuario;
            console.log("Dummy driver already exists.");
        } else {
            // Check roles
            let roleId = null;
            const [roles] = await pool.query(`SELECT IdRol FROM Roles WHERE NombreRol = 'Repartidor'`);
            if (roles.length > 0) {
                roleId = roles[0].IdRol;
            } else {
                const [newRole] = await pool.query(`INSERT INTO Roles (NombreRol) VALUES ('Repartidor')`);
                roleId = newRole.insertId;
            }

            // Insert driver (Password is 'driver123' properly hashed)
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPwd = await bcrypt.hash('driver123', salt);
            const [newDriver] = await pool.query(`
                INSERT INTO Usuarios (IdEmpresa, IdRol, NombreCompleto, Email, PasswordHash, Activo)
                VALUES (1, ?, 'Juan Repartidor', 'driver@mierp.com', ?, 1)
            `, [roleId, hashedPwd]);
            driverId = newDriver.insertId;
            console.log("Dummy driver created.");
        }

        // Insert a dummy sale and dispatch assigned to the driver if it doesn't exist
        const [desp] = await pool.query(`SELECT IdDespacho FROM Despachos WHERE IdRepartidor = ? LIMIT 1`, [driverId]);
        if (desp.length === 0) {
            const [doc] = await pool.query(`
               INSERT INTO Documentos (IdEmpresa, IdUsuarioCreador, TipoDocumento, SubTotal, Impuestos, Total, MetodoPago)
               VALUES (1, 1, 'Boleta', 10000, 1900, 11900, 'Efectivo')
           `);

            await pool.query(`
               INSERT INTO Despachos (IdVenta, IdRepartidor, EstadoEntrega, DireccionEntrega, ClienteNombre, FechaAsignacion)
               VALUES (?, ?, 'Pendiente', 'Av Siempreviva 123, Springfield', 'Carlos Cliente', NOW())
           `, [doc.insertId, driverId]);

            console.log("Dummy dispatch created for driver.");
        } else {
            console.log("Dummy dispatch already exists.");
        }

        console.log("Despachos DB adjustments done.");
        process.exit(0);
    } catch (e) {
        console.error("Error adjusting schema:", e);
        process.exit(1);
    }
}

fixDespachos();
