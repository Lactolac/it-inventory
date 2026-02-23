const Licencias = require('../models/Licencias');
const { NotFoundError } = require('../middleware/errorHandler');

class LicenciasController {
  // Create new license
  static async create(req, res, next) {
    try {
      const licencia = await Licencias.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Licencia creada exitosamente',
        data: licencia
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all licenses with pagination and filters
  static async findAll(req, res, next) {
    try {
      const { limit, offset, search, expiradas } = req.query;
      
      const licencias = await Licencias.findAll({
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
        search,
        expiradas
      });

      const total = await Licencias.count({ search, expiradas });

      res.json({
        success: true,
        data: licencias,
        pagination: {
          total,
          limit: parseInt(limit) || 50,
          offset: parseInt(offset) || 0,
          hasMore: (parseInt(offset) || 0) + licencias.length < total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single license by ID
  static async findById(req, res, next) {
    try {
      const { id } = req.params;
      const licencia = await Licencias.findById(id);

      if (!licencia) {
        throw new NotFoundError('Licencia no encontrada');
      }

      res.json({
        success: true,
        data: licencia
      });
    } catch (error) {
      next(error);
    }
  }

  // Update license
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const licencia = await Licencias.update(id, req.body);

      if (!licencia) {
        throw new NotFoundError('Licencia no encontrada');
      }

      res.json({
        success: true,
        message: 'Licencia actualizada exitosamente',
        data: licencia
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete license
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const licencia = await Licencias.delete(id);

      if (!licencia) {
        throw new NotFoundError('Licencia no encontrada');
      }

      res.json({
        success: true,
        message: 'Licencia eliminada exitosamente',
        data: licencia
      });
    } catch (error) {
      next(error);
    }
  }

  // Get licenses expiring soon
  static async getProximasExpirar(req, res, next) {
    try {
      const { dias = 30 } = req.query;
      const licencias = await Licencias.getProximasExpirar(parseInt(dias));

      res.json({
        success: true,
        data: licencias
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LicenciasController;
