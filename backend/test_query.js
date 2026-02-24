const pool = require('./config/db');

async function testQuery() {
    try {
        const idEmpresa = 1;
        const [productos] = await pool.query(`
            SELECT 
                p.IdProducto as id,
                p.SKU as sku,
                p.CodigoBarras as codigoBarras,
                p.Nombre as nombre,
                p.PrecioVenta as precioVenta,
                p.PrecioNeto as precioNeto,
                p.Costo as costo,
                COALESCE(s.Cantidad, 0) as stockActual,
                c.NombreCategoria as categoria
            FROM Productos p
            LEFT JOIN Stock s ON p.IdProducto = s.IdProducto
            LEFT JOIN Categorias c ON p.IdCategoria = c.IdCategoria
            WHERE p.IdEmpresa = ?
        `, [idEmpresa]);

        console.log("SQL Query Result:", JSON.stringify(productos, null, 2));
        process.exit(0);
    } catch (e) {
        console.error("SQL Error:", e);
        process.exit(1);
    }
}

testQuery();
