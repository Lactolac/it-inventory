const { query } = require('../config/database');

class Puesto {
  static async create(data) {
    const { nombre, iddepartamento } = data;

    const result = await query(
      `INSERT INTO puestos (nombre, iddepartamento)
       VALUES ($1, $2)
       RETURNING *`,
      [nombre, iddepartamento]
    );
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const { limit = 50, offset = 0, search, iddepartamento } = options;
    let sql = `SELECT p.*, d.nombre as departamento_nombre 
      FROM puestos p
      LEFT JOIN departamentos d ON p.iddepartamento = d.id`;
    
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`p.nombre ILIKE $${paramCount++}`);
      params.push(`%${search}%`);
    }

    if (iddepartamento) {
      conditions.push(`p.iddepartamento = $${paramCount++}`);
      params.push(iddepartamento);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY d.nombre ASC, p.nombre ASC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      `SELECT p.*, d.nombre as departamento_nombre 
       FROM puestos p
       LEFT JOIN departamentos d ON p.iddepartamento = d.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByNameAndDepartamento(nombre, iddepartamento) {
    const result = await query(
      'SELECT * FROM puestos WHERE nombre = $1 AND iddepartamento = $2',
      [nombre, iddepartamento]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { nombre, iddepartamento } = data;

    const result = await query(
      `UPDATE puestos 
       SET nombre = COALESCE($1, nombre), 
           iddepartamento = COALESCE($2, iddepartamento),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
      [nombre, iddepartamento, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const checkResult = await query(
      `SELECT COUNT(*) as usuarios FROM usuarios WHERE idpuesto = $1`,
      [id]
    );

    const { usuarios } = checkResult.rows[0];
    if (parseInt(usuarios) > 0) {
      throw new Error('No se puede eliminar el puesto porque tiene usuarios asociados');
    }

    const result = await query(
      'DELETE FROM puestos WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async count(options = {}) {
    const { search, iddepartamento } = options;
    let sql = 'SELECT COUNT(*) FROM puestos';
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('nombre ILIKE $' + (params.length + 1));
      params.push(`%${search}%`);
    }

    if (iddepartamento) {
      conditions.push('iddepartamento = $' + (params.length + 1));
      params.push(iddepartamento);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Puesto;
