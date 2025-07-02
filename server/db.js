require('dotenv').config();

const mysql = require('mysql2');

console.log('DB_HOST:', process.env.DB_HOST);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 15,
  waitForConnections: true,
  queueLimit: 0,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error getting MySQL connection:', err);
    return;
  }
  console.log('Connected to MySQL Database');
  connection.release();
});

module.exports = pool;
