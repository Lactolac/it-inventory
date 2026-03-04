const Inventario = require('../models/Inventario');
const { NotFoundError } = require('../middleware/errorHandler');

class InventarioController {
  // Create new inventory item
  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      
      if (req.files) {
        if (req.files.fotos_entrega) {
          data.fotos_entrega = req.files.fotos_entrega.map(file => `/uploads/inventory/${file.filename}`);
        }
        if (req.files.fotos_recepcion) {
          data.fotos_recepcion = req.files.fotos_recepcion.map(file => `/uploads/inventory/${file.filename}`);
        }
      }

      const item = await Inventario.create(data);
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
      // const data = { ...req.body }; // Removed as req.body is modified directly

      // Handle Categorized Multi-Photo Uploads
      if (req.files) {
        // Process Entrega photos
        let deliveryPhotos = [];
        if (req.body.fotos_entrega) {
          try {
            deliveryPhotos = typeof req.body.fotos_entrega === 'string' 
              ? JSON.parse(req.body.fotos_entrega) 
              : req.body.fotos_entrega;
          } catch (e) {
            deliveryPhotos = [];
          }
        }
        
        if (req.files.fotos_entrega) {
          const newDelivery = req.files.fotos_entrega.map(file => `/uploads/inventory/${file.filename}`);
          deliveryPhotos = [...deliveryPhotos, ...newDelivery];
        }
        if (deliveryPhotos.length > 0 || req.files.fotos_entrega) { // Only update if there are photos or new ones were uploaded
          req.body.fotos_entrega = deliveryPhotos;
        }

        // Process Recepcion photos
        let receptionPhotos = [];
        if (req.body.fotos_recepcion) {
          try {
            receptionPhotos = typeof req.body.fotos_recepcion === 'string' 
              ? JSON.parse(req.body.fotos_recepcion) 
              : req.body.fotos_recepcion;
          } catch (e) {
            receptionPhotos = [];
          }
        }
        
        if (req.files.fotos_recepcion) {
          const newReception = req.files.fotos_recepcion.map(file => `/uploads/inventory/${file.filename}`);
          receptionPhotos = [...receptionPhotos, ...newReception];
        }
        if (receptionPhotos.length > 0 || req.files.fotos_recepcion) { // Only update if there are photos or new ones were uploaded
          req.body.fotos_recepcion = receptionPhotos;
        }
      }

      const item = await Inventario.update(req.params.id, req.body);

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
      const data = { ...req.body };

      // Cast idusuario_asignado to null if it's "null" or empty from FormData
      if (data.idusuario_asignado === 'null' || data.idusuario_asignado === '') {
        data.idusuario_asignado = null;
      }

      if (req.files && req.files.fotos_entrega) {
        data.fotos_entrega = req.files.fotos_entrega.map(file => `/uploads/inventory/${file.filename}`);
      }

      const item = await Inventario.update(id, data);

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

}

module.exports = InventarioController;
