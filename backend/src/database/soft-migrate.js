const { pool } = require('../config/database');
require('dotenv').config();

const softMigrate = async () => {
  const client = await pool.connect();
  try {
    console.log('Running soft-migration check...');
    await client.query(`SET search_path TO "${process.env.DB_SCHEMA || 'public'}"`);
    
    // Check and add fotos_entrega
    const resEntrega = await client.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = $1 AND table_name = 'inventario' AND column_name = 'fotos_entrega'
    `, [process.env.DB_SCHEMA || 'public']);

    if (resEntrega.rowCount === 0) {
      console.log('Adding "fotos_entrega" column...');
      await client.query(`ALTER TABLE inventario ADD COLUMN fotos_entrega JSONB DEFAULT '[]'`);
    }

    // Check and add fotos_recepcion
    const resRecepcion = await client.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = $1 AND table_name = 'inventario' AND column_name = 'fotos_recepcion'
    `, [process.env.DB_SCHEMA || 'public']);

    if (resRecepcion.rowCount === 0) {
      console.log('Adding "fotos_recepcion" column...');
      await client.query(`ALTER TABLE inventario ADD COLUMN fotos_recepcion JSONB DEFAULT '[]'`);
    }

    // Cleanup old columns
    await client.query(`
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventario' AND column_name='fotoid') THEN
          ALTER TABLE inventario DROP COLUMN fotoid;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventario' AND column_name='fotos') THEN
          ALTER TABLE inventario DROP COLUMN fotos;
        END IF;

        -- Migración para licencias: de departamento a país
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='licencias' AND column_name='iddepartamento') 
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='licencias' AND column_name='idpais') THEN
          
          -- 1. Agregar columna idpais
          ALTER TABLE licencias ADD COLUMN idpais INTEGER REFERENCES paises(id);
          
          -- 2. Migrar datos existentes
          UPDATE licencias l 
          SET idpais = d.idpais 
          FROM departamentos d 
          WHERE l.iddepartamento = d.id;
          
          -- 3. Eliminar columna iddepartamento
          ALTER TABLE licencias DROP COLUMN iddepartamento;
          
          RAISE NOTICE 'Licencias table migrated from iddepartamento to idpais';
        END IF;
      END $$;
    `);
    
    console.log('Database schema check completed.');
  } catch (error) {
    console.error('Soft-migration failed:', error);
    // Don't throw error to allow server to start, but log it
  } finally {
    client.release();
  }
};

module.exports = softMigrate;
