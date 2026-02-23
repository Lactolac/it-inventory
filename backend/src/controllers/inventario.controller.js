const Inventario = require('../models/Inventario');
const { NotFoundError } = require('../middleware/errorHandler');

class InventarioController {
  // Create new inventory item
  static async create(req, res, next) {
    try {
      const item = await Inventario.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Item de inventario creado exitosamente',
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all inventory items with pagination and filters
  static async findAll(req, res, next) {
    try {
      const { limit, offset, tipo_dispositivo, search } = req.query;
      
      const items = await Inventario.findAll({
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
        tipo_dispositivo,
        search
      });

      const total = await Inventario.count({ tipo_dispositivo, search });

      res.json({
        success: true,
        data: items,
        pagination: {
          total,
          limit: parseInt(limit) || 50,
          offset: parseInt(offset) || 0,
          hasMore: (parseInt(offset) || 0) + items.length < total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single inventory item by ID
  static async findById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await Inventario.findById(id);

      if (!item) {
        throw new NotFoundError('Item de inventario no encontrado');
      }

      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  // Update inventory item
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const item = await Inventario.update(id, req.body);

      if (!item) {
        throw new NotFoundError('Item de inventario no encontrado');
      }

      res.json({
        success: true,
        message: 'Item de inventario actualizado exitosamente',
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete inventory item
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const item = await Inventario.delete(id);

      if (!item) {
        throw new NotFoundError('Item de inventario no encontrado');
      }

      res.json({
        success: true,
        message: 'Item de inventario eliminado exitosamente',
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  // Get device types
  static async getTiposDispositivo(req, res, next) {
    try {
      const tipos = await Inventario.getTiposDispositivo();
      res.json({
        success: true,
        data: tipos
      });
    } catch (error) {
      next(error);
    }
  }

  // Assign inventory to user
  static async asignarUsuario(req, res, next) {
    try {
      const { id } = req.params;
      const { idusuario_asignado } = req.body;

      const item = await Inventario.update(id, { idusuario_asignado });

      if (!item) {
        throw new NotFoundError('Item de inventario no encontrado');
      }

      res.json({
        success: true,
        message: 'Usuario asignado exitosamente',
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  // Set revision date
  static async setRevision(req, res, next) {
    try {
      const { id } = req.params;
      const { fecha_revision, idauditoria } = req.body;

      const item = await Inventario.update(id, { 
        fecha_revision, 
        idauditoria 
      });

      if (!item) {
        throw new NotFoundError('Item de inventario no encontrado');
      }

      res.json({
        success: true,
        message: 'Revisión programada exitosamente',
        data: item
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InventarioController;
