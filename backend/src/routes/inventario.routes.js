const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const InventarioController = require('../controllers/inventario.controller');
const { validate } = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Validation rules for creating inventory item
const createValidation = [
  body('nserie').optional().isString().trim(),
  body('marca').optional().isString().trim(),
  body('modelo').optional().isString().trim(),
  body('nactivofijo').optional().isString().trim(),
  body('cantidad').optional().isInt({ min: 1 }),
  body('tipo_dispositivo').optional().isString().trim(),
  body('id_usuario_registro').optional().isInt({ min: 1 }),
  validate
];

// Validation rules for updating inventory item
const updateValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  body('nserie').optional().isString().trim(),
  body('marca').optional().isString().trim(),
  body('modelo').optional().isString().trim(),
  body('nactivofijo').optional().isString().trim(),
  body('cantidad').optional().isInt({ min: 1 }),
  body('fechaingreso').optional().isDate(),
  body('fechaentrega').optional().isDate(),
  body('tipo_dispositivo').optional().isString().trim(),
  body('id_usuario_registro').optional().isInt({ min: 1 }),
  body('idauditoria').optional().isInt({ min: 1 }),
  body('idusuario_asignado').optional().isInt({ min: 1 }),
  body('fecha_revision').optional().isDate(),
  body('firma1').optional().isString(),
  body('firma2').optional().isString(),
  body('firma3').optional().isString(),
  body('fotoid').optional().isString(),
  validate
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  validate
];

const listValidation = [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('tipo_dispositivo').optional().isString(),
  query('search').optional().isString(),
  validate
];

/**
 * @swagger
 * /api/inventario:
 *   get:
 *     summary: Obtener lista de inventario
 *     tags: [Inventario]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Número máximo de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Número de resultados a saltar
 *       - in: query
 *         name: tipo_dispositivo
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de dispositivo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nserie, marca o modelo
 *     responses:
 *       200:
 *         description: Lista de inventario
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
 *                     $ref: '#/components/schemas/Inventario'
 *                 pagination:
 *                   type: object
 */
router.get('/', optionalAuth, listValidation, InventarioController.findAll);

/**
 * @swagger
 * /api/inventario/tipos-dispositivo:
 *   get:
 *     summary: Obtener tipos de dispositivo disponibles
 *     tags: [Inventario]
 *     responses:
 *       200:
 *         description: Lista de tipos de dispositivo
 */
router.get('/tipos-dispositivo', optionalAuth, InventarioController.getTiposDispositivo);

/**
 * @swagger
 * /api/inventario/{id}:
 *   get:
 *     summary: Obtener item de inventario por ID
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del item
 *     responses:
 *       200:
 *         description: Item de inventario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventario'
 *       404:
 *         description: Item no encontrado
 */
router.get('/:id', optionalAuth, idValidation, InventarioController.findById);

/**
 * @swagger
 * /api/inventario:
 *   post:
 *     summary: Crear nuevo item de inventario
 *     description: |
 *       Crea un nuevo item de inventario. La fecha de ingreso se establece automáticamente a la fecha actual.
 *       Campos opcionales que se pueden agregar posteriormente: fechaentrega, firmas, fotoid, fecha_revision, idauditoria, idusuario_asignado
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nserie:
 *                 type: string
 *                 example: SN-123456
 *               marca:
 *                 type: string
 *                 example: Dell
 *               modelo:
 *                 type: string
 *                 example: Latitude 5520
 *               nactivofijo:
 *                 type: string
 *                 example: AF-001
 *               cantidad:
 *                 type: integer
 *                 example: 1
 *               tipo_dispositivo:
 *                 type: string
 *                 example: Laptop
 *               id_usuario_registro:
 *                 type: integer
 *                 description: ID del usuario que está registrando el equipo
 *     responses:
 *       201:
 *         description: Item creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', authenticate, createValidation, InventarioController.create);

/**
 * @swagger
 * /api/inventario/{id}:
 *   put:
 *     summary: Actualizar item de inventario
 *     description: Actualiza cualquier campo del item incluyendo firmas, foto, fechas y asignaciones
 *     tags: [Inventario]
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
 *             properties:
 *               nserie:
 *                 type: string
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               nactivofijo:
 *                 type: string
 *               cantidad:
 *                 type: integer
 *               fechaingreso:
 *                 type: string
 *                 format: date
 *               fechaentrega:
 *                 type: string
 *                 format: date
 *               tipo_dispositivo:
 *                 type: string
 *               id_usuario_registro:
 *                 type: integer
 *               idauditoria:
 *                 type: integer
 *               idusuario_asignado:
 *                 type: integer
 *               fecha_revision:
 *                 type: string
 *                 format: date
 *               firma1:
 *                 type: string
 *                 description: Firma en base64
 *               firma2:
 *                 type: string
 *                 description: Firma en base64
 *               firma3:
 *                 type: string
 *                 description: Firma en base64
 *               fotoid:
 *                 type: string
 *                 description: Identificador de foto
 *     responses:
 *       200:
 *         description: Item actualizado
 *       404:
 *         description: Item no encontrado
 */
router.put('/:id', authenticate, updateValidation, InventarioController.update);

/**
 * @swagger
 * /api/inventario/{id}:
 *   delete:
 *     summary: Eliminar item de inventario
 *     tags: [Inventario]
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
 *         description: Item eliminado
 *       404:
 *         description: Item no encontrado
 */
router.delete('/:id', authenticate, idValidation, InventarioController.delete);

/**
 * @swagger
 * /api/inventario/{id}/asignar:
 *   post:
 *     summary: Asignar usuario a item de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idusuario_asignado:
 *                 type: integer
 *                 description: ID del usuario a asignar
 *     responses:
 *       200:
 *         description: Usuario asignado
 */
router.post('/:id/asignar', authenticate, [
  param('id').isInt({ min: 1 }),
  body('idusuario_asignado').optional().isInt({ min: 1 }),
  validate
], InventarioController.asignarUsuario);

/**
 * @swagger
 * /api/inventario/{id}/revision:
 *   post:
 *     summary: Programar revisión para item
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_revision:
 *                 type: string
 *                 format: date
 *               idauditoria:
 *                 type: integer
 *                 description: ID del auditor
 *     responses:
 *       200:
 *         description: Revisión programada
 */
router.post('/:id/revision', authenticate, [
  param('id').isInt({ min: 1 }),
  body('fecha_revision').optional().isDate(),
  body('idauditoria').optional().isInt({ min: 1 }),
  validate
], InventarioController.setRevision);

module.exports = router;
