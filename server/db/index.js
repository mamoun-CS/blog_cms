const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool instance with PostgreSQL connection details
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'blog_cms',
  password: process.env.DB_PASSWORD || '0598897496',
  port: process.env.DB_PORT || 5433,
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database');
  release();
});

// Export the query function to be used by models
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};