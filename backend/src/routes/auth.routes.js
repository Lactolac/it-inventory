const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

// Validation rules
const loginValidation = [
  body('username').notEmpty().withMessage('Usuario es requerido').isString().trim(),
  body('password').notEmpty().withMessage('Contraseña es requerida'),
  body('country').optional().isString().trim(),
  validate
];

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión con credenciales AD
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: samuel
 *               password:
 *                 type: string
 *                 example: Benavides2025
 *               country:
 *                 type: string
 *                 example: sv
 *                 description: Código de país, por defecto sv
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', loginValidation, AuthController.login);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar validez del token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Token inválido
 */
router.get('/verify', authenticate, AuthController.verify);

module.exports = router;
