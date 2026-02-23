const Pais = require('../models/Pais');

const getAll = async (req, res) => {
  try {
    const { search, activo } = req.query;
    const paises = await Pais.getAll({ 
      search, 
      activo: activo !== undefined ? activo === 'true' : null 
    });
    res.json({ data: paises });
  } catch (error) {
    console.error('Error getting paises:', error);
    res.status(500).json({ error: 'Error al obtener países' });
  }
};

const getActive = async (req, res) => {
  try {
    const paises = await Pais.getActive();
    res.json({ data: paises });
  } catch (error) {
    console.error('Error getting active paises:', error);
    res.status(500).json({ error: 'Error al obtener países activos' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const pais = await Pais.getById(id);
    if (!pais) {
      return res.status(404).json({ error: 'País no encontrado' });
    }
    res.json({ data: pais });
  } catch (error) {
    console.error('Error getting pais:', error);
    res.status(500).json({ error: 'Error al obtener país' });
  }
};

const create = async (req, res) => {
  try {
    const { nombre, codigo, activo } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    const pais = await Pais.create({ nombre, codigo, activo });
    res.status(201).json({ data: pais, message: 'País creado correctamente' });
  } catch (error) {
    console.error('Error creating pais:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un país con ese nombre' });
    }
    res.status(500).json({ error: 'Error al crear país' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, codigo, activo } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    const pais = await Pais.update(id, { nombre, codigo, activo });
    if (!pais) {
      return res.status(404).json({ error: 'País no encontrado' });
    }
    res.json({ data: pais, message: 'País actualizado correctamente' });
  } catch (error) {
    console.error('Error updating pais:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un país con ese nombre' });
    }
    res.status(500).json({ error: 'Error al actualizar país' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const pais = await Pais.delete(id);
    if (!pais) {
      return res.status(404).json({ error: 'País no encontrado' });
    }
    res.json({ message: 'País eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting pais:', error);
    if (error.message.includes('asociados')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al eliminar país' });
  }
};

module.exports = {
  getAll,
  getActive,
  getById,
  create,
  update,
  remove
};
