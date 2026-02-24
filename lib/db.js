import mysql from 'mysql2/promise';

// Connection pool untuk better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Kosong jika tidak ada
  database: process.env.DB_DATABASE || 'cortexlog_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Connection config:', {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_DATABASE || 'cortexlog_db',
      port: process.env.DB_PORT || '3306',
    });
    throw error;
  }
}

export async function query(sql, values) {
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.execute(sql, values);
    return results;
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
