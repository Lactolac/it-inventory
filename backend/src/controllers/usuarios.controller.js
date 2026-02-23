const Usuarios = require('../models/Usuarios');
const { NotFoundError } = require('../middleware/errorHandler');

class UsuariosController {
  // Create new user
  static async create(req, res, next) {
    try {
      const usuario = await Usuarios.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all users with pagination and filters
  static async findAll(req, res, next) {
    try {
      const { limit, offset, search, iddepartamento } = req.query;
      
      const usuarios = await Usuarios.findAll({
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
        search,
        iddepartamento: iddepartamento ? parseInt(iddepartamento) : undefined
      });

      const total = await Usuarios.count({ search, iddepartamento });

      res.json({
        success: true,
        data: usuarios,
        pagination: {
          total,
          limit: parseInt(limit) || 50,
          offset: parseInt(offset) || 0,
          hasMore: (parseInt(offset) || 0) + usuarios.length < total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single user by ID
  static async findById(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await Usuarios.findById(id);

      if (!usuario) {
        throw new NotFoundError('Usuario no encontrado');
      }

      res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await Usuarios.update(id, req.body);

      if (!usuario) {
        throw new NotFoundError('Usuario no encontrado');
      }

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await Usuarios.delete(id);

      if (!usuario) {
        throw new NotFoundError('Usuario no encontrado');
      }

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all areas
  static async getAreas(req, res, next) {
    try {
      const areas = await Usuarios.getAreas();
      res.json({
        success: true,
        data: areas
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all departments
  static async getDepartamentos(req, res, next) {
    try {
      const dptos = await Usuarios.getDepartamentos();
      res.json({
        success: true,
        data: dptos
      });
    } catch (error) {
      next(error);
    }
  }

  // Assign inventory to user
  static async asignarInventario(req, res, next) {
    try {
      const { id } = req.params;
      const { inventarioId } = req.body;

      const usuario = await Usuarios.asignarInventario(id, inventarioId);

      if (!usuario) {
        throw new NotFoundError('Usuario no encontrado');
      }

      res.json({
        success: true,
        message: 'Inventario asignado exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  // Assign license to user
  static async asignarLicencia(req, res, next) {
    try {
      const { id } = req.params;
      const { licenciaId } = req.body;

      const usuario = await Usuarios.asignarLicencia(id, licenciaId);

      if (!usuario) {
        throw new NotFoundError('Usuario no encontrado');
      }

      res.json({
        success: true,
        message: 'Licencia asignada exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove inventory from user
  static async removerInventario(req, res, next) {
    try {
      const { id } = req.params;

      const usuario = await Usuarios.removerInventario(id);

      if (!usuario) {
        throw new NotFoundError('Usuario no encontrado');
      }

      res.json({
        success: true,
        message: 'Inventario removido exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove license from user
  static async removerLicencia(req, res, next) {
    try {
      const { id } = req.params;

      const usuario = await Usuarios.removerLicencia(id);

      if (!usuario) {
        throw new NotFoundError('Usuario no encontrado');
      }

      res.json({
        success: true,
        message: 'Licencia removida exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsuariosController;
