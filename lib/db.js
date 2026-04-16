import { Pool } from 'pg';

// Connection pool untuk PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin',
  database: process.env.DB_DATABASE || 'CortexLogDB',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function getConnection() {
  try {
    const connection = await pool.connect();
    return connection;
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Connection config:', {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      database: process.env.DB_DATABASE || 'CortexLogDB',
      port: process.env.DB_PORT || '5432',
    });
    throw error;
  }
}

/**
 * Execute a query using parameterized queries (safer against SQL injection)
 * For PostgreSQL, use $1, $2, etc. as placeholders instead of ?
 */
export async function query(sql, values = []) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.query(sql, values);
    return result.rows;
  } catch (error) {
    console.error('Query error:', error.message);
    console.error('SQL:', sql);
    console.error('Values:', values);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export default pool;
