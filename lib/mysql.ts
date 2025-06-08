// lib/mysql.ts
import mysql from 'mysql2/promise';

export async function connectToDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,      // 103.87.66.148
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,  // Your database name
    port: parseInt(process.env.DB_PORT || '3306', 10), // 3306
  });
  return connection;
}