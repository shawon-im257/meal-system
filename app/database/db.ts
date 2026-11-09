import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'meal_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl:
    process.env.DB_SSL === 'true' || process.env.DB_HOST?.includes('tidbcloud') || process.env.DB_HOST?.includes('aiven')
      ? { rejectUnauthorized: false }
      : undefined,
});

export default pool;
