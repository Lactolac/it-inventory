const Departamento = require('../models/Departamento');
const Puesto = require('../models/Puesto');

const departamentosController = {
  async getAll(req, res) {
    try {
      const { limit, offset, search, idcd, idpais } = req.query;
      const departamentos = await Departamento.findAll({ 
        limit: parseInt(limit) || 50, 
        offset: parseInt(offset) || 0,
        search,
        idcd,
        idpais
      });
      const total = await Departamento.count({ search, idcd, idpais });
      res.json({ data: departamentos, total });
    } catch (error) {
      console.error('Error al obtener departamentos:', error);
      res.status(500).json({ error: 'Error al obtener departamentos' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const departamento = await Departamento.findById(id);
      if (!departamento) {
        return res.status(404).json({ error: 'Departamento no encontrado' });
      }
      res.json(departamento);
    } catch (error) {
      console.error('Error al obtener departamento:', error);
      res.status(500).json({ error: 'Error al obtener departamento' });
    }
  },

  async create(req, res) {
    try {
      const { nombre, idpais, idcd } = req.body;
      
      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const departamento = await Departamento.create({ nombre, idpais, idcd });
      res.status(201).json(departamento);
    } catch (error) {
      console.error('Error al crear departamento:', error);
      res.status(500).json({ error: 'Error al crear departamento' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, idpais, idcd } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const departamento = await Departamento.update(id, { nombre, idpais, idcd });
      if (!departamento) {
        return res.status(404).json({ error: 'Departamento no encontrado' });
      }
      res.json(departamento);
    } catch (error) {
      console.error('Error al actualizar departamento:', error);
      res.status(500).json({ error: 'Error al actualizar departamento' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const departamento = await Departamento.delete(id);
      if (!departamento) {
        return res.status(404).json({ error: 'Departamento no encontrado' });
      }
      res.json({ message: 'Departamento eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar departamento:', error);
      if (error.message.includes('registros asociados')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error al eliminar departamento' });
    }
  },

  async getPuestos(req, res) {
    try {
      const { id } = req.params;
      const puestos = await Puesto.findAll({ iddepartamento: id });
      res.json({ data: puestos });
    } catch (error) {
      console.error('Error al obtener puestos del departamento:', error);
      res.status(500).json({ error: 'Error al obtener puestos del departamento' });
    }
  }
};

module.exports = departamentosController;
