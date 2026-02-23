const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const UsuariosController = require('../controllers/usuarios.controller');
const { validate } = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Validation rules
const createValidation = [
  body('nombre').notEmpty().withMessage('El nombre es requerido').isString().trim(),
  body('area').optional().isString().trim(),
  body('dpto').optional().isString().trim(),
  body('puesto').optional().isString().trim(),
  body('correo').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('idinventario').optional().isInt({ min: 1 }),
  body('idlicencia').optional().isInt({ min: 1 }),
  body('idccostos').optional().isInt({ min: 1 }),
  validate
];

const updateValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  body('nombre').optional().isString().trim(),
  body('area').optional().isString().trim(),
  body('dpto').optional().isString().trim(),
  body('puesto').optional().isString().trim(),
  body('correo').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('idinventario').optional().isInt({ min: 1 }),
  body('idlicencia').optional().isInt({ min: 1 }),
  body('idccostos').optional().isInt({ min: 1 }),
  validate
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  validate
];

const listValidation = [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('search').optional().isString(),
  query('idccostos').optional().isInt({ min: 1 }),
  query('area').optional().isString(),
  validate
];

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener lista de usuarios
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: idccostos
 *         schema:
 *           type: integer
 *         description: Filtrar por centro de costos
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *         description: Filtrar por área
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 */
router.get('/', optionalAuth, listValidation, UsuariosController.findAll);

/**
 * @swagger
 * /api/usuarios/areas:
 *   get:
 *     summary: Obtener lista de áreas disponibles
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de áreas
 */
router.get('/areas', optionalAuth, UsuariosController.getAreas);

/**
 * @swagger
 * /api/usuarios/departamentos:
 *   get:
 *     summary: Obtener lista de departamentos disponibles
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de departamentos
 */
router.get('/departamentos', optionalAuth, UsuariosController.getDepartamentos);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', optionalAuth, idValidation, UsuariosController.findById);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuario creado
 */
router.post('/', authenticate, createValidation, UsuariosController.create);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put('/:id', authenticate, updateValidation, UsuariosController.update);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */
router.delete('/:id', authenticate, idValidation, UsuariosController.delete);

/**
 * @swagger
 * /api/usuarios/{id}/asignar-inventario:
 *   post:
 *     summary: Asignar inventario a usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inventarioId
 *             properties:
 *               inventarioId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Inventario asignado
 */
router.post('/:id/asignar-inventario', authenticate, [
  param('id').isInt({ min: 1 }),
  body('inventarioId').isInt({ min: 1 }),
  validate
], UsuariosController.asignarInventario);

/**
 * @swagger
 * /api/usuarios/{id}/asignar-licencia:
 *   post:
 *     summary: Asignar licencia a usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - licenciaId
 *             properties:
 *               licenciaId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Licencia asignada
 */
router.post('/:id/asignar-licencia', authenticate, [
  param('id').isInt({ min: 1 }),
  body('licenciaId').isInt({ min: 1 }),
  validate
], UsuariosController.asignarLicencia);

/**
 * @swagger
 * /api/usuarios/{id}/remover-inventario:
 *   delete:
 *     summary: Remover inventario de usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inventario removido
 */
router.delete('/:id/remover-inventario', authenticate, idValidation, UsuariosController.removerInventario);

/**
 * @swagger
 * /api/usuarios/{id}/remover-licencia:
 *   delete:
 *     summary: Remover licencia de usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Licencia removida
 */
router.delete('/:id/remover-licencia', authenticate, idValidation, UsuariosController.removerLicencia);

module.exports = router;
