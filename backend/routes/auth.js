const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Registrar un nuevo usuario (útil para inicializar)
// @access  Public / Admin (Idealmente protegido en producción)
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
router.post('/login', authController.login);

module.exports = router;
