const { pool } = require('../config/database');
require('dotenv').config();

class CentroDistribucion {
  static async getAll({ search = '', idpais = null, activo = null }) {
    const schema = process.env.DB_SCHEMA;
    let query = `
      SELECT cd.*, p.nombre as pais_nombre,
        (SELECT COUNT(*) FROM "${schema}".departamentos d WHERE d.idcd = cd.id) as total_departamentos
      FROM "${schema}".centros_distribucion cd
      LEFT JOIN "${schema}".paises p ON cd.idpais = p.id
      WHERE 1=1
    `;
    const params = [];
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (cd.nombre ILIKE $${params.length} OR cd.codigo ILIKE $${params.length})`;
    }
    
    if (idpais) {
      params.push(idpais);
      query += ` AND cd.idpais = $${params.length}`;
    }
    
    if (activo !== null) {
      params.push(activo);
      query += ` AND cd.activo = $${params.length}`;
    }
    
    query += ' ORDER BY p.nombre, cd.nombre';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getById(id) {
    const schema = process.env.DB_SCHEMA;
    const query = `
      SELECT cd.*, p.nombre as pais_nombre
      FROM "${schema}".centros_distribucion cd
      LEFT JOIN "${schema}".paises p ON cd.idpais = p.id
      WHERE cd.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByPais(idpais) {
    const schema = process.env.DB_SCHEMA;
    const query = `
      SELECT * FROM "${schema}".centros_distribucion 
      WHERE idpais = $1 
      ORDER BY nombre
    `;
    const result = await pool.query(query, [idpais]);
    return result.rows;
  }

  static async getActive() {
    const schema = process.env.DB_SCHEMA;
    const query = `
      SELECT cd.*, p.nombre as pais_nombre
      FROM "${schema}".centros_distribucion cd
      LEFT JOIN "${schema}".paises p ON cd.idpais = p.id
      ORDER BY p.nombre, cd.nombre
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async create(data) {
    const schema = process.env.DB_SCHEMA;
    const { nombre, idpais, codigo = null, activo = true } = data;
    
    const query = `
      INSERT INTO "${schema}".centros_distribucion (nombre, idpais, codigo, activo)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, idpais, codigo, activo]);
    return result.rows[0];
  }

  static async update(id, data) {
    const schema = process.env.DB_SCHEMA;
    const { nombre, idpais, codigo = null, activo = true } = data;
    
    const query = `
      UPDATE "${schema}".centros_distribucion 
      SET nombre = $1, idpais = $2, codigo = $3, activo = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, idpais, codigo, activo, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const schema = process.env.DB_SCHEMA;
    
    // Check if there are related records
    const checkQuery = `
      SELECT COUNT(*) as total FROM "${schema}".departamentos WHERE idcd = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows[0].total > 0) {
      throw new Error('No se puede eliminar el centro de distribución porque tiene departamentos asociados');
    }
    
    const query = `DELETE FROM "${schema}".centros_distribucion WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = CentroDistribucion;
