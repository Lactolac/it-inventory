const { query } = require('../config/database');

class Departamento {
  static async create(data) {
    const { nombre, idpais, idcd } = data;

    const result = await query(
      `INSERT INTO departamentos (nombre, idpais, idcd)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, idpais || null, idcd || null]
    );
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const { limit = 50, offset = 0, search } = options;
    let sql = `SELECT d.*, 
      p.nombre as pais_nombre,
      cd.nombre as cd_nombre,
      (SELECT COUNT(*) FROM usuarios u WHERE u.iddepartamento = d.id) as total_usuarios,
      (SELECT COUNT(*) FROM licencias l WHERE l.iddepartamento = d.id) as total_licencias,
      (SELECT COUNT(*) FROM puestos p WHERE p.iddepartamento = d.id) as total_puestos
      FROM departamentos d
      LEFT JOIN paises p ON d.idpais = p.id
      LEFT JOIN centros_distribucion cd ON d.idcd = cd.id`;
    
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`(d.nombre ILIKE $${paramCount} OR p.nombre ILIKE $${paramCount} OR cd.nombre ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY d.nombre ASC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      `SELECT d.*, 
        p.nombre as pais_nombre,
        cd.nombre as cd_nombre,
        (SELECT COUNT(*) FROM usuarios u WHERE u.iddepartamento = d.id) as total_usuarios,
        (SELECT COUNT(*) FROM licencias l WHERE l.iddepartamento = d.id) as total_licencias,
        (SELECT COUNT(*) FROM puestos p WHERE p.iddepartamento = d.id) as total_puestos
       FROM departamentos d
       LEFT JOIN paises p ON d.idpais = p.id
       LEFT JOIN centros_distribucion cd ON d.idcd = cd.id
       WHERE d.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByName(nombre) {
    const result = await query(
      'SELECT * FROM departamentos WHERE nombre = $1',
      [nombre]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { nombre, idpais, idcd } = data;

    const result = await query(
      `UPDATE departamentos 
       SET nombre = COALESCE($1, nombre), 
           idpais = COALESCE($2, idpais), 
           idcd = COALESCE($3, idcd),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING *`,
      [nombre, idpais, idcd, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const checkResult = await query(
      `SELECT 
        (SELECT COUNT(*) FROM usuarios WHERE iddepartamento = $1) as usuarios,
        (SELECT COUNT(*) FROM licencias WHERE iddepartamento = $1) as licencias,
        (SELECT COUNT(*) FROM puestos WHERE iddepartamento = $1) as puestos`,
      [id]
    );

    const { usuarios, licencias, puestos } = checkResult.rows[0];
    if (parseInt(usuarios) > 0 || parseInt(licencias) > 0 || parseInt(puestos) > 0) {
      throw new Error('No se puede eliminar el departamento porque tiene registros asociados');
    }

    const result = await query(
      'DELETE FROM departamentos WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async count(options = {}) {
    const { search } = options;
    let sql = `SELECT COUNT(*) FROM departamentos d
      LEFT JOIN paises p ON d.idpais = p.id
      LEFT JOIN centros_distribucion cd ON d.idcd = cd.id`;
    const params = [];

    if (search) {
      sql += ' WHERE (d.nombre ILIKE $1 OR p.nombre ILIKE $1 OR cd.nombre ILIKE $1)';
      params.push(`%${search}%`);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
  }

  static async getPuestos(id) {
    const result = await query(
      `SELECT * FROM puestos WHERE iddepartamento = $1 ORDER BY nombre`,
      [id]
    );
    return result.rows;
  }
}

module.exports = Departamento;
