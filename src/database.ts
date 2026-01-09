import mysql from "mysql2/promise";

// Crea POOL de conexiones
const pool = mysql.createPool({
  // process.env significa que toma los valores del archivo .env
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
});

export default pool;