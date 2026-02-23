const express = require('express');
const router = express.Router();
const departamentosController = require('../controllers/departamentos.controller');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Departamentos
 *   description: Gestión de departamentos
 */

/**
 * @swagger
 * /api/departamentos:
 *   get:
 *     summary: Obtener todos los departamentos
 *     tags: [Departamentos]
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
 *     responses:
 *       200:
 *         description: Lista de departamentos
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticate, departamentosController.getAll);

/**
 * @swagger
 * /api/departamentos/{id}:
 *   get:
 *     summary: Obtener departamento por ID
 *     tags: [Departamentos]
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
 *         description: Departamento encontrado
 *       404:
 *         description: Departamento no encontrado
 */
router.get('/:id', authenticate, departamentosController.getById);

/**
 * @swagger
 * /api/departamentos/{id}/puestos:
 *   get:
 *     summary: Obtener puestos de un departamento
 *     tags: [Departamentos]
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
 *         description: Lista de puestos del departamento
 */
router.get('/:id/puestos', authenticate, departamentosController.getPuestos);

/**
 * @swagger
 * /api/departamentos:
 *   post:
 *     summary: Crear nuevo departamento
 *     tags: [Departamentos]
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
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Departamento creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/', authenticate, departamentosController.create);

/**
 * @swagger
 * /api/departamentos/{id}:
 *   put:
 *     summary: Actualizar departamento
 *     tags: [Departamentos]
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
 *     responses:
 *       200:
 *         description: Departamento actualizado
 *       404:
 *         description: Departamento no encontrado
 */
router.put('/:id', authenticate, departamentosController.update);

/**
 * @swagger
 * /api/departamentos/{id}:
 *   delete:
 *     summary: Eliminar departamento
 *     tags: [Departamentos]
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
 *         description: Departamento eliminado
 *       400:
 *         description: No se puede eliminar, tiene registros asociados
 *       404:
 *         description: Departamento no encontrado
 */
router.delete('/:id', authenticate, departamentosController.delete);

module.exports = router;
