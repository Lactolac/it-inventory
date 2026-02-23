const { query } = require('../config/database');

class Inventario {
  static async create(data) {
    const {
      nserie,
      marca,
      modelo,
      nactivofijo,
      cantidad = 1,
      fechaingreso,
      fechaentrega,
      fotoid,
      fecha_revision,
      tipo_dispositivo,
      id_usuario_registro,
      idauditoria,
      idusuario_asignado
    } = data;

    const result = await query(
      `INSERT INTO inventario 
       (nserie, marca, modelo, nactivofijo, cantidad, fechaingreso, fechaentrega, 
        fotoid, fecha_revision, tipo_dispositivo, 
        id_usuario_registro, idauditoria, idusuario_asignado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [nserie, marca, modelo, nactivofijo, cantidad, fechaingreso, fechaentrega,
       fotoid, fecha_revision, tipo_dispositivo,
       id_usuario_registro, idauditoria, idusuario_asignado]
    );
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const { limit = 50, offset = 0, tipo_dispositivo, search } = options;
    let sql = `SELECT i.*, 
      u1.nombre as usuario_registro_nombre,
      u2.nombre as auditor_nombre,
      u3.nombre as usuario_asignado_nombre
      FROM inventario i
      LEFT JOIN usuarios u1 ON i.id_usuario_registro = u1.id
      LEFT JOIN usuarios u2 ON i.idauditoria = u2.id
      LEFT JOIN usuarios u3 ON i.idusuario_asignado = u3.id`;
    
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (tipo_dispositivo) {
      conditions.push(`i.tipo_dispositivo = $${paramCount++}`);
      params.push(tipo_dispositivo);
    }

    if (search) {
      conditions.push(`(i.nserie ILIKE $${paramCount} OR i.marca ILIKE $${paramCount} OR i.modelo ILIKE $${paramCount} OR i.nactivofijo ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY i.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      `SELECT i.*, 
        u1.nombre as usuario_registro_nombre,
        u2.nombre as auditor_nombre,
        u3.nombre as usuario_asignado_nombre
        FROM inventario i
        LEFT JOIN usuarios u1 ON i.id_usuario_registro = u1.id
        LEFT JOIN usuarios u2 ON i.idauditoria = u2.id
        LEFT JOIN usuarios u3 ON i.idusuario_asignado = u3.id
        WHERE i.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByNserie(nserie) {
    const result = await query(
      'SELECT * FROM inventario WHERE nserie = $1',
      [nserie]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'nserie', 'marca', 'modelo', 'nactivofijo', 'cantidad', 
      'fechaingreso', 'fechaentrega',
      'fotoid', 'fecha_revision', 'tipo_dispositivo',
      'id_usuario_registro', 'idauditoria', 'idusuario_asignado'
    ];

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
      `UPDATE inventario SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query(
      'DELETE FROM inventario WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async count(options = {}) {
    const { tipo_dispositivo, search } = options;
    let sql = 'SELECT COUNT(*) FROM inventario';
    const conditions = [];
    const params = [];

    if (tipo_dispositivo) {
      conditions.push(`tipo_dispositivo = $${params.length + 1}`);
      params.push(tipo_dispositivo);
    }

    if (search) {
      conditions.push(`(nserie ILIKE $${params.length + 1} OR marca ILIKE $${params.length + 1} OR modelo ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
  }

  static async getTiposDispositivo() {
    const result = await query(
      'SELECT DISTINCT tipo_dispositivo FROM inventario WHERE tipo_dispositivo IS NOT NULL ORDER BY tipo_dispositivo'
    );
    return result.rows.map(row => row.tipo_dispositivo);
  }
}

module.exports = Inventario;
