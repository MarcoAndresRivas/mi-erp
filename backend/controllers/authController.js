const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro (Solo para crear los primeros usuarios/empresas de manera de prueba)
exports.register = async (req, res) => {
    const { idEmpresa, idRol, nombreCompleto, email, password } = req.body;

    try {
        // Verificar si la empresa y rol existen sería necesario en un sistema real, aquí
        // asumiremos que se pasan correctamente o se crearon previamente en SQL.

        // Verificar si usuario ya existe
        const [existingUser] = await pool.query('SELECT * FROM Usuarios WHERE Email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Hashear password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insertar usuario
        const [result] = await pool.query(
            'INSERT INTO Usuarios (IdEmpresa, IdRol, NombreCompleto, Email, PasswordHash) VALUES (?, ?, ?, ?, ?)',
            [idEmpresa, idRol, nombreCompleto, email, passwordHash]
        );

        res.status(201).json({ message: 'Usuario registrado correctamente', userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al registrar usuario' });
    }
};

// Login de Usuario
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario
        const [users] = await pool.query(
            `SELECT u.*, r.NombreRol, e.Nombre as NombreEmpresa 
             FROM Usuarios u 
             JOIN Roles r ON u.IdRol = r.IdRol 
             JOIN Empresas e ON u.IdEmpresa = e.IdEmpresa
             WHERE u.Email = ? AND u.Activo = 1`,
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // Verificar password
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Crear payload del token
        const payload = {
            usuario: {
                id: user.IdUsuario,
                idEmpresa: user.IdEmpresa,
                idRol: user.IdRol,
                rol: user.NombreRol,
                nombre: user.NombreCompleto,
                empresa: user.NombreEmpresa
            }
        };

        // Firmar Token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '10h' }, // El token expira en 10 horas
            (err, token) => {
                if (err) throw err;
                res.json({ token, usuario: payload.usuario });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al iniciar sesión' });
    }
};
