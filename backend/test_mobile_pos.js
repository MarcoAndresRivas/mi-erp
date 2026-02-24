const axios = require('axios');
const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function ensureVendedor() {
    console.log("Ensuring dummy Vendedor exists...");
    let vendedorId = null;
    const [users] = await pool.query(`SELECT IdUsuario FROM Usuarios WHERE Email = 'vendedor@mierp.com'`);
    if (users.length > 0) {
        vendedorId = users[0].IdUsuario;
    } else {
        let roleId = null;
        const [roles] = await pool.query(`SELECT IdRol FROM Roles WHERE NombreRol = 'Vendedor'`);
        if (roles.length > 0) {
            roleId = roles[0].IdRol;
        } else {
            const [newRole] = await pool.query(`INSERT INTO Roles (NombreRol) VALUES ('Vendedor')`);
            roleId = newRole.insertId;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPwd = await bcrypt.hash('vendedor123', salt);
        const [newUser] = await pool.query(`
            INSERT INTO Usuarios (IdEmpresa, IdRol, NombreCompleto, Email, PasswordHash, Activo)
            VALUES (1, ?, 'Ana Vendedora', 'vendedor@mierp.com', ?, 1)
        `, [roleId, hashedPwd]);
        vendedorId = newUser.insertId;
        console.log("Dummy Vendedor created.");
    }
    return vendedorId;
}

async function testVendedorPosFlow() {
    try {
        await ensureVendedor();

        console.log("\nTesting Login for Vendedor...");
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'vendedor@mierp.com',
            password: 'vendedor123'
        });

        const token = loginRes.data.token;
        console.log("Login successful. Token:", token.substring(0, 15) + "...");

        console.log("\nTesting GET /api/productos...");
        const getProductsRes = await axios.get('http://localhost:5000/api/productos', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Found ${getProductsRes.data.length} products to sell.`);

        if (getProductsRes.data.length > 0) {
            const prod1 = getProductsRes.data[0];
            const prod2 = getProductsRes.data.length > 1 ? getProductsRes.data[1] : getProductsRes.data[0];

            console.log("\nTesting POST /api/ventas...");
            const postVentaRes = await axios.post('http://localhost:5000/api/ventas', {
                cart: [
                    { id: prod1.id, cantidad: 1, precioVenta: 5000, subtotal: 5000 },
                    { id: prod2.id, cantidad: 1, precioVenta: 5000, subtotal: 5000 }
                ],
                method: 'Efectivo',
                subtotal: 10000,
                tax: 1900,
                total: 11900
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Test POST /api/ventas successful: ", postVentaRes.data);
        } else {
            console.log("No products found, skipping POS sell test.");
        }

    } catch (e) {
        console.error("Test failed:", e.response ? e.response.data : e.message);
        if (e.response && e.response.status) {
            console.error("Status:", e.response.status);
        } else {
            console.error(e);
        }
    } finally {
        process.exit(0);
    }
}
testVendedorPosFlow();
