const { pool } = require('../config/database');
require('dotenv').config();

const createSchema = async () => {
  try {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "${process.env.DB_SCHEMA}"`);
    console.log(`Schema '${process.env.DB_SCHEMA}' created or already exists`);
  } catch (error) {
    console.error('Error creating schema:', error);
    throw error;
  }
};

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query(`SET search_path TO "${process.env.DB_SCHEMA}"`);
    
    // Drop existing tables if they exist (to recreate with new schema)
    await client.query(`DROP TABLE IF EXISTS inventario CASCADE`);
    await client.query(`DROP TABLE IF EXISTS usuarios CASCADE`);
    await client.query(`DROP TABLE IF EXISTS licencias CASCADE`);
    await client.query(`DROP TABLE IF EXISTS puestos CASCADE`);
    await client.query(`DROP TABLE IF EXISTS departamentos CASCADE`);
    await client.query(`DROP TABLE IF EXISTS centros_distribucion CASCADE`);
    await client.query(`DROP TABLE IF EXISTS paises CASCADE`);
    console.log('Old tables dropped');
    
    // Tabla paises
    await client.query(`
      CREATE TABLE paises (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        codigo VARCHAR(10),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table paises created');

    // Tabla centros_distribucion
    await client.query(`
      CREATE TABLE centros_distribucion (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        idpais INTEGER REFERENCES paises(id),
        codigo VARCHAR(20),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(nombre, idpais)
      )
    `);
    console.log('Table centros_distribucion created');
    
    // Tabla departamentos (antes centro_costos)
    await client.query(`
      CREATE TABLE departamentos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        idpais INTEGER REFERENCES paises(id),
        idcd INTEGER REFERENCES centros_distribucion(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(nombre, idpais, idcd)
      )
    `);
    console.log('Table departamentos created');

    // Tabla puestos
    await client.query(`
      CREATE TABLE puestos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        iddepartamento INTEGER REFERENCES departamentos(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(nombre, iddepartamento)
      )
    `);
    console.log('Table puestos created');

    // Tabla usuarios
    await client.query(`
      CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        correo VARCHAR(255) UNIQUE,
        idinventario INTEGER,
        idlicencia INTEGER,
        iddepartamento INTEGER REFERENCES departamentos(id),
        idpuesto INTEGER REFERENCES puestos(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table usuarios created');

    // Tabla licencias
    await client.query(`
      CREATE TABLE licencias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        fexpiraciones DATE,
        fcompra DATE,
        cantidad INTEGER DEFAULT 1,
        idpais INTEGER REFERENCES paises(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table licencias created');

    // Tabla inventario (sin firmas)
    await client.query(`
      CREATE TABLE inventario (
        id SERIAL PRIMARY KEY,
        nserie VARCHAR(255) UNIQUE,
        marca VARCHAR(100),
        modelo VARCHAR(100),
        nactivofijo VARCHAR(100),
        cantidad INTEGER DEFAULT 1,
        fechaingreso DATE DEFAULT CURRENT_DATE,
        fechaentrega DATE,
        fotos_entrega JSONB DEFAULT '[]',
        fotos_recepcion JSONB DEFAULT '[]',
        fecha_revision DATE,
        tipo_dispositivo VARCHAR(100),
        id_usuario_registro INTEGER REFERENCES usuarios(id),
        idauditoria INTEGER REFERENCES usuarios(id),
        idusuario_asignado INTEGER REFERENCES usuarios(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table inventario created');

    // Add columns if they don't exist
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventario' AND column_name='fotos_entrega') THEN
          ALTER TABLE inventario ADD COLUMN fotos_entrega JSONB DEFAULT '[]';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventario' AND column_name='fotos_recepcion') THEN
          ALTER TABLE inventario ADD COLUMN fotos_recepcion JSONB DEFAULT '[]';
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventario' AND column_name='fotoid') THEN
          ALTER TABLE inventario DROP COLUMN fotoid;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventario' AND column_name='fotos') THEN
          ALTER TABLE inventario DROP COLUMN fotos;
        END IF;
      END $$;
    `);

    // Add foreign key constraints for usuarios table
    await client.query(`
      ALTER TABLE usuarios 
      ADD CONSTRAINT fk_usuarios_inventario 
      FOREIGN KEY (idinventario) REFERENCES inventario(id) ON DELETE SET NULL
    `);
    console.log('FK usuarios-inventario created');
    
    await client.query(`
      ALTER TABLE usuarios 
      ADD CONSTRAINT fk_usuarios_licencia 
      FOREIGN KEY (idlicencia) REFERENCES licencias(id) ON DELETE SET NULL
    `);
    console.log('FK usuarios-licencia created');

    // Create indexes
    await client.query(`CREATE INDEX idx_inventario_nserie ON inventario(nserie)`);
    await client.query(`CREATE INDEX idx_inventario_tipo ON inventario(tipo_dispositivo)`);
    await client.query(`CREATE INDEX idx_usuarios_correo ON usuarios(correo)`);
    await client.query(`CREATE INDEX idx_usuarios_departamento ON usuarios(iddepartamento)`);
    await client.query(`CREATE INDEX idx_licencias_pais ON licencias(idpais)`);
    await client.query(`CREATE INDEX idx_puestos_departamento ON puestos(iddepartamento)`);
    await client.query(`CREATE INDEX idx_centros_pais ON centros_distribucion(idpais)`);
    await client.query(`CREATE INDEX idx_departamentos_pais ON departamentos(idpais)`);
    await client.query(`CREATE INDEX idx_departamentos_cd ON departamentos(idcd)`);
    
    console.log('All indexes created');
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

const runMigrations = async () => {
  try {
    console.log('Starting migrations...');
    await createSchema();
    await createTables();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
