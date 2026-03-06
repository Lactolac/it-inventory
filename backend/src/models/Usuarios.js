const { query } = require('../config/database');

class Usuarios {
  static async create(data) {
    const {
      nombre,
      correo,
      idinventario,
      idlicencia,
      iddepartamento,
      idpuesto
    } = data;

    const result = await query(
      `INSERT INTO usuarios 
       (nombre, correo, idinventario, idlicencia, iddepartamento, idpuesto)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nombre, correo, idinventario, idlicencia, iddepartamento, idpuesto]
    );
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const { limit = 50, offset = 0, search, iddepartamento } = options;
    let sql = `SELECT u.*, 
      i.nserie as inventario_nserie,
      i.marca as inventario_marca,
      i.modelo as inventario_modelo,
      l.nombre as licencia_nombre,
      d.nombre as departamento_nombre,
      p.nombre as puesto_nombre,
      cd.nombre as cd_nombre,
      pa.nombre as pais_nombre,
      d.idcd,
      d.idpais
      FROM usuarios u
      LEFT JOIN inventario i ON u.idinventario = i.id
      LEFT JOIN licencias l ON u.idlicencia = l.id
      LEFT JOIN departamentos d ON u.iddepartamento = d.id
      LEFT JOIN puestos p ON u.idpuesto = p.id
      LEFT JOIN centros_distribucion cd ON d.idcd = cd.id
      LEFT JOIN paises pa ON d.idpais = pa.id`;
    
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`(u.nombre ILIKE $${paramCount} OR u.correo ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (iddepartamento) {
      conditions.push(`u.iddepartamento = $${paramCount++}`);
      params.push(iddepartamento);
    }

    if (options.idcd) {
      conditions.push(`d.idcd = $${paramCount++}`);
      params.push(options.idcd);
    }

    if (options.idpais) {
      conditions.push(`d.idpais = $${paramCount++}`);
      params.push(options.idpais);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY u.nombre ASC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      `SELECT u.*, 
        i.nserie as inventario_nserie,
        i.marca as inventario_marca,
        i.modelo as inventario_modelo,
        l.nombre as licencia_nombre,
        d.nombre as departamento_nombre,
        p.nombre as puesto_nombre,
        cd.nombre as cd_nombre,
        pa.nombre as pais_nombre,
        d.idcd,
        d.idpais
       FROM usuarios u
       LEFT JOIN inventario i ON u.idinventario = i.id
       LEFT JOIN licencias l ON u.idlicencia = l.id
       LEFT JOIN departamentos d ON u.iddepartamento = d.id
       LEFT JOIN puestos p ON u.idpuesto = p.id
       LEFT JOIN centros_distribucion cd ON d.idcd = cd.id
       LEFT JOIN paises pa ON d.idpais = pa.id
       WHERE u.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByCorreo(correo) {
    const result = await query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['nombre', 'correo', 'idinventario', 'idlicencia', 'iddepartamento', 'idpuesto'];

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
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    // Check if user has assigned inventory
    const checkResult = await query(
      `SELECT 
        (SELECT COUNT(*) FROM inventario WHERE id_usuario_registro = $1) as registrado,
        (SELECT COUNT(*) FROM inventario WHERE idauditoria = $1) as auditor,
        (SELECT COUNT(*) FROM inventario WHERE idusuario_asignado = $1) as asignado`,
      [id]
    );

    const { registrado, auditor, asignado } = checkResult.rows[0];
    if (parseInt(registrado) > 0 || parseInt(auditor) > 0 || parseInt(asignado) > 0) {
      throw new Error('No se puede eliminar el usuario porque tiene registros de inventario asociados');
    }

    const result = await query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async count(options = {}) {
    const { search, iddepartamento, idcd, idpais } = options;
    let sql = `SELECT COUNT(*) FROM usuarios u
      LEFT JOIN departamentos d ON u.iddepartamento = d.id`;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(`(nombre ILIKE $${params.length + 1} OR correo ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (iddepartamento) {
      conditions.push(`u.iddepartamento = $${params.length + 1}`);
      params.push(iddepartamento);
    }

    if (idcd) {
      conditions.push(`d.idcd = $${params.length + 1}`);
      params.push(idcd);
    }

    if (idpais) {
      conditions.push(`d.idpais = $${params.length + 1}`);
      params.push(idpais);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
  }

  static async asignarInventario(usuarioId, inventarioId) {
    const result = await query(
      `UPDATE usuarios SET idinventario = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [inventarioId, usuarioId]
    );
    return result.rows[0];
  }

  static async asignarLicencia(usuarioId, licenciaId) {
    const result = await query(
      `UPDATE usuarios SET idlicencia = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [licenciaId, usuarioId]
    );
    return result.rows[0];
  }

  static async removerInventario(usuarioId) {
    const result = await query(
      `UPDATE usuarios SET idinventario = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [usuarioId]
    );
    return result.rows[0];
  }

  static async removerLicencia(usuarioId) {
    const result = await query(
      `UPDATE usuarios SET idlicencia = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [usuarioId]
    );
    return result.rows[0];
  }
}

module.exports = Usuarios;
