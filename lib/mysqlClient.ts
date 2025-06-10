import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '103.87.66.148',
  user: 'root',
  password: 'Admin123!',
  database: 'bookings',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;