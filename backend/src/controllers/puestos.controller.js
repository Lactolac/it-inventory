const Puesto = require('../models/Puesto');
const Departamento = require('../models/Departamento');

const puestosController = {
  async getAll(req, res) {
    try {
      const { limit, offset, search, iddepartamento } = req.query;
      const puestos = await Puesto.findAll({ 
        limit: parseInt(limit) || 50, 
        offset: parseInt(offset) || 0,
        search,
        iddepartamento
      });
      const total = await Puesto.count({ search, iddepartamento });
      res.json({ data: puestos, total });
    } catch (error) {
      console.error('Error al obtener puestos:', error);
      res.status(500).json({ error: 'Error al obtener puestos' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const puesto = await Puesto.findById(id);
      if (!puesto) {
        return res.status(404).json({ error: 'Puesto no encontrado' });
      }
      res.json(puesto);
    } catch (error) {
      console.error('Error al obtener puesto:', error);
      res.status(500).json({ error: 'Error al obtener puesto' });
    }
  },

  async create(req, res) {
    try {
      const { nombre, iddepartamento } = req.body;
      
      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      if (!iddepartamento) {
        return res.status(400).json({ error: 'El departamento es requerido' });
      }

      const departamento = await Departamento.findById(iddepartamento);
      if (!departamento) {
        return res.status(400).json({ error: 'El departamento no existe' });
      }

      const existing = await Puesto.findByNameAndDepartamento(nombre, iddepartamento);
      if (existing) {
        return res.status(400).json({ error: 'Ya existe un puesto con ese nombre en este departamento' });
      }

      const puesto = await Puesto.create({ nombre, iddepartamento });
      res.status(201).json(puesto);
    } catch (error) {
      console.error('Error al crear puesto:', error);
      res.status(500).json({ error: 'Error al crear puesto' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, iddepartamento } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      if (iddepartamento) {
        const departamento = await Departamento.findById(iddepartamento);
        if (!departamento) {
          return res.status(400).json({ error: 'El departamento no existe' });
        }
      }

      const existing = await Puesto.findByNameAndDepartamento(nombre, iddepartamento);
      if (existing && existing.id !== parseInt(id)) {
        return res.status(400).json({ error: 'Ya existe un puesto con ese nombre en este departamento' });
      }

      const puesto = await Puesto.update(id, { nombre, iddepartamento });
      if (!puesto) {
        return res.status(404).json({ error: 'Puesto no encontrado' });
      }
      res.json(puesto);
    } catch (error) {
      console.error('Error al actualizar puesto:', error);
      res.status(500).json({ error: 'Error al actualizar puesto' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const puesto = await Puesto.delete(id);
      if (!puesto) {
        return res.status(404).json({ error: 'Puesto no encontrado' });
      }
      res.json({ message: 'Puesto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar puesto:', error);
      if (error.message.includes('usuarios asociados')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error al eliminar puesto' });
    }
  }
};

module.exports = puestosController;
