const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Set schema on connection
pool.on('connect', (client) => {
  client.query(`SET search_path TO "${process.env.DB_SCHEMA}"`);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
