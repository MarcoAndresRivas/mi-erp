const axios = require('axios');

async function testMobileFlow() {
    try {
        console.log("Testing Login...");
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'driver@mierp.com',
            password: 'driver123'
        });

        const token = loginRes.data.token;
        console.log("Login successful. Token:", token.substring(0, 15) + "...");

        console.log("\nTesting GET /api/pedidos/repartidor...");
        const getRes = await axios.get('http://localhost:5000/api/pedidos/repartidor', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Pedidos:", JSON.stringify(getRes.data, null, 2));

        if (getRes.data.length > 0) {
            const despachoId = getRes.data[0].id;
            console.log(`\nTesting PUT /api/pedidos/${despachoId}/estado ...`);
            const putRes = await axios.put(`http://localhost:5000/api/pedidos/${despachoId}/estado`, {
                estado: 'En Ruta'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Update Success:", putRes.data);

            // Re-fetch to confirm
            const getRes2 = await axios.get('http://localhost:5000/api/pedidos/repartidor', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Updated Pedidos:", JSON.stringify(getRes2.data, null, 2));

            // Revert status
            await axios.put(`http://localhost:5000/api/pedidos/${despachoId}/estado`, {
                estado: 'Pendiente'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }
    } catch (e) {
        console.error("Test failed:", e.response?.data || e.message);
    }
}
testMobileFlow();
