const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'portfolio_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'stock_portfolio',
  password: process.env.DB_PASSWORD || 'secure_password_123',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 20, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // how long to wait when connecting
});

// Error handling for pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('✅ Connected to PostgreSQL database');
  release();
});

module.exports = pool;
