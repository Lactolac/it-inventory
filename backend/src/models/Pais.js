const { pool } = require('../config/database');
require('dotenv').config();

class Pais {
  static async getAll({ search = '', activo = null }) {
    const schema = process.env.DB_SCHEMA;
    let query = `
      SELECT p.*, 
        (SELECT COUNT(*) FROM "${schema}".centros_distribucion cd WHERE cd.idpais = p.id) as total_centros,
        (SELECT COUNT(*) FROM "${schema}".departamentos d WHERE d.idpais = p.id) as total_departamentos
      FROM "${schema}".paises p
      WHERE 1=1
    `;
    const params = [];
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.nombre ILIKE $${params.length} OR p.codigo ILIKE $${params.length})`;
    }
    
    if (activo !== null) {
      params.push(activo);
      query += ` AND p.activo = $${params.length}`;
    }
    
    query += ' ORDER BY p.nombre';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getById(id) {
    const schema = process.env.DB_SCHEMA;
    const query = `
      SELECT * FROM "${schema}".paises WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getActive() {
    const schema = process.env.DB_SCHEMA;
    const query = `
      SELECT * FROM "${schema}".paises 
      WHERE activo = true 
      ORDER BY nombre
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async create(data) {
    const schema = process.env.DB_SCHEMA;
    const { nombre, codigo = null, activo = true } = data;
    
    const query = `
      INSERT INTO "${schema}".paises (nombre, codigo, activo)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, codigo, activo]);
    return result.rows[0];
  }

  static async update(id, data) {
    const schema = process.env.DB_SCHEMA;
    const { nombre, codigo = null, activo = true } = data;
    
    const query = `
      UPDATE "${schema}".paises 
      SET nombre = $1, codigo = $2, activo = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, codigo, activo, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const schema = process.env.DB_SCHEMA;
    
    // Check if there are related records
    const checkQuery = `
      SELECT 
        (SELECT COUNT(*) FROM "${schema}".centros_distribucion WHERE idpais = $1) as centros,
        (SELECT COUNT(*) FROM "${schema}".departamentos WHERE idpais = $1) as departamentos
    `;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows[0].centros > 0 || checkResult.rows[0].departamentos > 0) {
      throw new Error('No se puede eliminar el país porque tiene centros de distribución o departamentos asociados');
    }
    
    const query = `DELETE FROM "${schema}".paises WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Pais;
