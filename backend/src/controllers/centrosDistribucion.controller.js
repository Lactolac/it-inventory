const CentroDistribucion = require('../models/CentroDistribucion');

const getAll = async (req, res) => {
  try {
    const { search, idpais, activo } = req.query;
    const centros = await CentroDistribucion.getAll({ 
      search, 
      idpais,
      activo: activo !== undefined ? activo === 'true' : null 
    });
    res.json({ data: centros });
  } catch (error) {
    console.error('Error getting centros de distribución:', error);
    res.status(500).json({ error: 'Error al obtener centros de distribución' });
  }
};

const getActive = async (req, res) => {
  try {
    const centros = await CentroDistribucion.getActive();
    res.json({ data: centros });
  } catch (error) {
    console.error('Error getting active centros:', error);
    res.status(500).json({ error: 'Error al obtener centros de distribución activos' });
  }
};

const getByPais = async (req, res) => {
  try {
    const { idpais } = req.params;
    const centros = await CentroDistribucion.getByPais(idpais);
    res.json({ data: centros });
  } catch (error) {
    console.error('Error getting centros by pais:', error);
    res.status(500).json({ error: 'Error al obtener centros de distribución' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const centro = await CentroDistribucion.getById(id);
    if (!centro) {
      return res.status(404).json({ error: 'Centro de distribución no encontrado' });
    }
    res.json({ data: centro });
  } catch (error) {
    console.error('Error getting centro:', error);
    res.status(500).json({ error: 'Error al obtener centro de distribución' });
  }
};

const create = async (req, res) => {
  try {
    const { nombre, idpais, codigo, activo } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    if (!idpais) {
      return res.status(400).json({ error: 'El país es requerido' });
    }
    
    const centro = await CentroDistribucion.create({ nombre, idpais, codigo, activo });
    res.status(201).json({ data: centro, message: 'Centro de distribución creado correctamente' });
  } catch (error) {
    console.error('Error creating centro:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un centro de distribución con ese nombre en este país' });
    }
    res.status(500).json({ error: 'Error al crear centro de distribución' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, idpais, codigo, activo } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    if (!idpais) {
      return res.status(400).json({ error: 'El país es requerido' });
    }
    
    const centro = await CentroDistribucion.update(id, { nombre, idpais, codigo, activo });
    if (!centro) {
      return res.status(404).json({ error: 'Centro de distribución no encontrado' });
    }
    res.json({ data: centro, message: 'Centro de distribución actualizado correctamente' });
  } catch (error) {
    console.error('Error updating centro:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un centro de distribución con ese nombre en este país' });
    }
    res.status(500).json({ error: 'Error al actualizar centro de distribución' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const centro = await CentroDistribucion.delete(id);
    if (!centro) {
      return res.status(404).json({ error: 'Centro de distribución no encontrado' });
    }
    res.json({ message: 'Centro de distribución eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting centro:', error);
    if (error.message.includes('asociados')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al eliminar centro de distribución' });
  }
};

module.exports = {
  getAll,
  getActive,
  getByPais,
  getById,
  create,
  update,
  remove
};
