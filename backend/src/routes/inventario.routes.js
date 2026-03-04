const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const InventarioController = require('../controllers/inventario.controller');
const { validate } = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload.middleware');

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
  body('firma1').optional().isString(),
  body('firma2').optional().isString(),
  body('firma3').optional().isString(),
  validate
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  validate
];

const listValidation = [
  query('limit').optional().isInt({ min: 1, max: 1000 }),
  query('offset').optional().isInt({ min: 0 }),
  query('tipo_dispositivo').optional().isString(),
  query('search').optional().isString(),
  validate
];

router.get('/', optionalAuth, listValidation, InventarioController.findAll);
router.get('/tipos-dispositivo', optionalAuth, InventarioController.getTiposDispositivo);
router.get('/:id', optionalAuth, idValidation, InventarioController.findById);

router.post('/', authenticate, upload.fields([
  { name: 'fotos_entrega', maxCount: 10 },
  { name: 'fotos_recepcion', maxCount: 10 }
]), createValidation, InventarioController.create);

router.put('/:id', authenticate, upload.fields([
  { name: 'fotos_entrega', maxCount: 10 },
  { name: 'fotos_recepcion', maxCount: 10 }
]), updateValidation, InventarioController.update);

router.delete('/:id', authenticate, idValidation, InventarioController.delete);

router.post('/:id/asignar', 
  authenticate, 
  upload.fields([{ name: 'fotos_entrega', maxCount: 10 }]), 
  param('id').isInt({ min: 1 }),
  body('idusuario_asignado').optional().isInt({ min: 1 }),
  validate, 
  InventarioController.asignarUsuario
);

module.exports = router;
