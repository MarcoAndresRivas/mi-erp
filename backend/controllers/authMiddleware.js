const jwt = require('jsonwebtoken');

// Middleware para verificar si hay token y es válido (Autenticación)
exports.verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'No hay token, autorización denegada' });
    }

    try {
        // Formato esperado: "Bearer [token]"
        const tokenLimpio = token.split(' ')[1];

        const decoded = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
        req.usuario = decoded.usuario;
        next();
    } catch (err) {
        res.status(401).json({ message: 'El token no es válido' });
    }
};

// Middleware para validar si el rol del usuario cuenta con permisos
exports.requireRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Verifica si el rol del usuario está en el arreglo de roles permitidos
        // NOTA: req.usuario.rol almacena el nombre literal ej: "Administrador"
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ message: 'Acceso denegado: Privilegios insuficientes' });
        }

        next();
    };
};
