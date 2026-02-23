const express = require('express');
const router = express.Router();
const centrosController = require('../controllers/centrosDistribucion.controller');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', centrosController.getAll);
router.get('/active', centrosController.getActive);
router.get('/pais/:idpais', centrosController.getByPais);
router.get('/:id', centrosController.getById);
router.post('/', centrosController.create);
router.put('/:id', centrosController.update);
router.delete('/:id', centrosController.remove);

module.exports = router;
