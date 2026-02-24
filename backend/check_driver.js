const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function checkUser() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPwd = await bcrypt.hash('driver123', salt);
        await pool.query(`UPDATE Usuarios SET PasswordHash = ? WHERE Email = 'driver@mierp.com'`, [hashedPwd]);
        const [users] = await pool.query(`SELECT IdUsuario, Email, PasswordHash FROM Usuarios WHERE Email = 'driver@mierp.com'`);
        console.log("Updated driver:", users);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkUser();
