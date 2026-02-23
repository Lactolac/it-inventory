const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const LicenciasController = require('../controllers/licencias.controller');
const { validate } = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Validation rules
const createValidation = [
  body('nombre').notEmpty().withMessage('El nombre es requerido').isString().trim(),
  body('fexpiraciones').optional().isDate(),
  body('fcompra').optional().isDate(),
  body('cantidad').optional().isInt({ min: 1 }),
  body('idcostos').optional().isInt({ min: 1 }),
  validate
];

const updateValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  body('nombre').optional().isString().trim(),
  body('fexpiraciones').optional().isDate(),
  body('fcompra').optional().isDate(),
  body('cantidad').optional().isInt({ min: 1 }),
  body('idcostos').optional().isInt({ min: 1 }),
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
  query('expiradas').optional().isIn(['true', 'false']),
  validate
];

/**
 * @swagger
 * /api/licencias:
 *   get:
 *     summary: Obtener lista de licencias
 *     tags: [Licencias]
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
 *         name: expiradas
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filtrar por licencias expiradas o no expiradas
 *     responses:
 *       200:
 *         description: Lista de licencias
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
 *                     $ref: '#/components/schemas/Licencia'
 */
router.get('/', optionalAuth, listValidation, LicenciasController.findAll);

/**
 * @swagger
 * /api/licencias/proximas-expirar:
 *   get:
 *     summary: Obtener licencias próximas a expirar
 *     tags: [Licencias]
 *     parameters:
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Días hacia adelante para buscar
 *     responses:
 *       200:
 *         description: Lista de licencias próximas a expirar
 */
router.get('/proximas-expirar', optionalAuth, LicenciasController.getProximasExpirar);

/**
 * @swagger
 * /api/licencias/{id}:
 *   get:
 *     summary: Obtener licencia por ID
 *     tags: [Licencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Licencia encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Licencia'
 *       404:
 *         description: Licencia no encontrada
 */
router.get('/:id', optionalAuth, idValidation, LicenciasController.findById);

/**
 * @swagger
 * /api/licencias:
 *   post:
 *     summary: Crear nueva licencia
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Licencia'
 *     responses:
 *       201:
 *         description: Licencia creada
 */
router.post('/', authenticate, createValidation, LicenciasController.create);

/**
 * @swagger
 * /api/licencias/{id}:
 *   put:
 *     summary: Actualizar licencia
 *     tags: [Licencias]
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
 *             $ref: '#/components/schemas/Licencia'
 *     responses:
 *       200:
 *         description: Licencia actualizada
 */
router.put('/:id', authenticate, updateValidation, LicenciasController.update);

/**
 * @swagger
 * /api/licencias/{id}:
 *   delete:
 *     summary: Eliminar licencia
 *     tags: [Licencias]
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
 *         description: Licencia eliminada
 */
router.delete('/:id', authenticate, idValidation, LicenciasController.delete);

module.exports = router;
