const { query } = require('../config/database');

class Licencias {
  static async create(data) {
    const {
      nombre,
      fexpiraciones,
      fcompra,
      cantidad = 1,
      idpais
    } = data;

    const result = await query(
      `INSERT INTO licencias 
       (nombre, fexpiraciones, fcompra, cantidad, idpais)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre, fexpiraciones, fcompra, cantidad, idpais]
    );
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const { limit = 50, offset = 0, search, expiradas } = options;
    let sql = `SELECT l.*, p.nombre as pais_nombre
      FROM licencias l
      LEFT JOIN paises p ON l.idpais = p.id`;
    
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`l.nombre ILIKE $${paramCount++}`);
      params.push(`%${search}%`);
    }

    if (expiradas === 'true') {
      conditions.push(`l.fexpiraciones < CURRENT_DATE`);
    } else if (expiradas === 'false') {
      conditions.push(`l.fexpiraciones >= CURRENT_DATE OR l.fexpiraciones IS NULL`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY l.fexpiraciones ASC NULLS LAST LIMIT $${paramCount++} OFFSET $${paramCount}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      `SELECT l.*, p.nombre as pais_nombre
       FROM licencias l
       LEFT JOIN paises p ON l.idpais = p.id
       WHERE l.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['nombre', 'fexpiraciones', 'fcompra', 'cantidad', 'idpais'];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE licencias SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query(
      'DELETE FROM licencias WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async count(options = {}) {
    const { search, expiradas } = options;
    let sql = 'SELECT COUNT(*) FROM licencias';
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(`nombre ILIKE $${params.length + 1}`);
      params.push(`%${search}%`);
    }

    if (expiradas === 'true') {
      conditions.push(`fexpiraciones < CURRENT_DATE`);
    } else if (expiradas === 'false') {
      conditions.push(`fexpiraciones >= CURRENT_DATE OR fexpiraciones IS NULL`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
  }

  static async getProximasExpirar(dias = 30) {
    const result = await query(
      `SELECT l.*, p.nombre as pais_nombre
       FROM licencias l
       LEFT JOIN paises p ON l.idpais = p.id
       WHERE l.fexpiraciones BETWEEN CURRENT_DATE AND CURRENT_DATE + $1
       ORDER BY l.fexpiraciones ASC`,
      [dias]
    );
    return result.rows;
  }
}

module.exports = Licencias;
