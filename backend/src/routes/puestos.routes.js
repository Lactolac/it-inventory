const express = require('express');
const router = express.Router();
const puestosController = require('../controllers/puestos.controller');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Puestos
 *   description: Gestión de puestos
 */

/**
 * @swagger
 * /api/puestos:
 *   get:
 *     summary: Obtener todos los puestos
 *     tags: [Puestos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Número de resultados a saltar
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre
 *       - in: query
 *         name: iddepartamento
 *         schema:
 *           type: integer
 *         description: Filtrar por departamento
 *     responses:
 *       200:
 *         description: Lista de puestos
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticate, puestosController.getAll);

/**
 * @swagger
 * /api/puestos/{id}:
 *   get:
 *     summary: Obtener puesto por ID
 *     tags: [Puestos]
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
 *         description: Puesto encontrado
 *       404:
 *         description: Puesto no encontrado
 */
router.get('/:id', authenticate, puestosController.getById);

/**
 * @swagger
 * /api/puestos:
 *   post:
 *     summary: Crear nuevo puesto
 *     tags: [Puestos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - iddepartamento
 *             properties:
 *               nombre:
 *                 type: string
 *               iddepartamento:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Puesto creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/', authenticate, puestosController.create);

/**
 * @swagger
 * /api/puestos/{id}:
 *   put:
 *     summary: Actualizar puesto
 *     tags: [Puestos]
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
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *               iddepartamento:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Puesto actualizado
 *       404:
 *         description: Puesto no encontrado
 */
router.put('/:id', authenticate, puestosController.update);

/**
 * @swagger
 * /api/puestos/{id}:
 *   delete:
 *     summary: Eliminar puesto
 *     tags: [Puestos]
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
 *         description: Puesto eliminado
 *       400:
 *         description: No se puede eliminar, tiene usuarios asociados
 *       404:
 *         description: Puesto no encontrado
 */
router.delete('/:id', authenticate, puestosController.delete);

module.exports = router;
