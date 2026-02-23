const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    try {
        console.log('🔄 Iniciando poblado (seed) de la base de datos...');

        // 1. Insertar la Empresa Inicial (Supermercado)
        const [empresaExiste] = await pool.query('SELECT * FROM Empresas WHERE Nombre = ?', ['Mi Supermercado']);
        let idEmpresa;
        if (empresaExiste.length === 0) {
            const [resultEmpresa] = await pool.query(
                "INSERT INTO Empresas (Nombre, Rut, TipoNegocio) VALUES ('Mi Supermercado', '11111111-1', 'Supermercado')"
            );
            idEmpresa = resultEmpresa.insertId;
            console.log('✅ Empresa creada:', idEmpresa);
        } else {
            idEmpresa = empresaExiste[0].IdEmpresa;
            console.log('ℹ️ Empresa ya existe:', idEmpresa);
        }

        // 2. Insertar los Roles Base
        const roles = ['Administrador', 'Vendedor', 'Cajero', 'Repartidor'];
        for (const rol of roles) {
            const [rolExiste] = await pool.query('SELECT * FROM Roles WHERE NombreRol = ?', [rol]);
            if (rolExiste.length === 0) {
                await pool.query('INSERT INTO Roles (NombreRol) VALUES (?)', [rol]);
                console.log(`✅ Rol creado: ${rol}`);
            }
        }

        // 3. Crear el primer usuario Administrador del Sistema
        const emailAdmin = 'admin@mierp.com';
        const passwordAdmin = 'admin123';
        const [adminExiste] = await pool.query('SELECT * FROM Usuarios WHERE Email = ?', [emailAdmin]);

        if (adminExiste.length === 0) {
            const [adminRolResult] = await pool.query('SELECT IdRol FROM Roles WHERE NombreRol = ?', ['Administrador']);
            const idRolAdmin = adminRolResult[0].IdRol;

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(passwordAdmin, salt);

            await pool.query(
                'INSERT INTO Usuarios (IdEmpresa, IdRol, NombreCompleto, Email, PasswordHash) VALUES (?, ?, ?, ?, ?)',
                [idEmpresa, idRolAdmin, 'Administrador Principal', emailAdmin, passwordHash]
            );
            console.log(`✅ Usuario admin creado (Email: ${emailAdmin} / Pass: ${passwordAdmin})`);
        } else {
            console.log('ℹ️ Usuario admin ya existe.');
        }

        console.log('🎉 Seed finalizado correctamente.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error ejecutando seed:', error);
        process.exit(1);
    }
}

seedDatabase();
