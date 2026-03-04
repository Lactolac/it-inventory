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
      fecha_revision,
      tipo_dispositivo,
      id_usuario_registro,
      idauditoria,
      idusuario_asignado,
      fotos_entrega = '[]',
      fotos_recepcion = '[]'
    } = data;

    const result = await query(
      `INSERT INTO inventario
       (nserie, marca, modelo, nactivofijo, cantidad, fechaingreso, fechaentrega,
        fecha_revision, tipo_dispositivo,
        id_usuario_registro, idauditoria, idusuario_asignado,
        fotos_entrega, fotos_recepcion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [nserie, marca, modelo, nactivofijo, cantidad, fechaingreso, fechaentrega,
       fecha_revision, tipo_dispositivo,
       id_usuario_registro, idauditoria, idusuario_asignado,
       typeof fotos_entrega === 'string' ? fotos_entrega : JSON.stringify(fotos_entrega),
       typeof fotos_recepcion === 'string' ? fotos_recepcion : JSON.stringify(fotos_recepcion)]
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
    
    // Parse JSON fields for each item
    return result.rows.map(item => ({
      ...item,
      fotos_entrega: typeof item.fotos_entrega === 'string' 
        ? JSON.parse(item.fotos_entrega || '[]') 
        : item.fotos_entrega,
      fotos_recepcion: typeof item.fotos_recepcion === 'string' 
        ? JSON.parse(item.fotos_recepcion || '[]') 
        : item.fotos_recepcion
    }));
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
    
    if (!result.rows[0]) return null;
    
    const item = result.rows[0];
    // Parse JSON fields
    item.fotos_entrega = typeof item.fotos_entrega === 'string' 
      ? JSON.parse(item.fotos_entrega || '[]') 
      : item.fotos_entrega;
    item.fotos_recepcion = typeof item.fotos_recepcion === 'string' 
      ? JSON.parse(item.fotos_recepcion || '[]') 
      : item.fotos_recepcion;
    
    return item;
  }

  static async findByNserie(nserie) {
    const result = await query(
      'SELECT * FROM inventario WHERE nserie = $1',
      [nserie]
    );
    
    if (!result.rows[0]) return null;
    
    const item = result.rows[0];
    // Parse JSON fields
    item.fotos_entrega = typeof item.fotos_entrega === 'string' 
      ? JSON.parse(item.fotos_entrega || '[]') 
      : item.fotos_entrega;
    item.fotos_recepcion = typeof item.fotos_recepcion === 'string' 
      ? JSON.parse(item.fotos_recepcion || '[]') 
      : item.fotos_recepcion;
    
    return item;
  }

  static async update(id, data) {
    const allowedFields = [
      'nserie', 'marca', 'modelo', 'nactivofijo', 'cantidad',
      'fechaingreso', 'fechaentrega', 'tipo_dispositivo',
      'id_usuario_registro', 'idauditoria', 'idusuario_asignado',
      'fecha_revision', 'firma1', 'firma2', 'firma3',
      'fotos_entrega', 'fotos_recepcion'
    ];

    const updates = [];
    const values = [];
    let idx = 1;

    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${idx}`);
        const value = data[key];

        // Handle JSONB fields
        if ((key === 'fotos_entrega' || key === 'fotos_recepcion') && typeof value !== 'string') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }

        idx++;
      }
    });

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE inventario SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    
    if (!result.rows[0]) return null;
    
    const item = result.rows[0];
    // Parse JSON fields
    item.fotos_entrega = typeof item.fotos_entrega === 'string' 
      ? JSON.parse(item.fotos_entrega || '[]') 
      : item.fotos_entrega;
    item.fotos_recepcion = typeof item.fotos_recepcion === 'string' 
      ? JSON.parse(item.fotos_recepcion || '[]') 
      : item.fotos_recepcion;
    
    return item;
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
