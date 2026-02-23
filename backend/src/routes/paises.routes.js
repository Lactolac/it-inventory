const express = require('express');
const router = express.Router();
const paisesController = require('../controllers/paises.controller');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', paisesController.getAll);
router.get('/active', paisesController.getActive);
router.get('/:id', paisesController.getById);
router.post('/', paisesController.create);
router.put('/:id', paisesController.update);
router.delete('/:id', paisesController.remove);

module.exports = router;
