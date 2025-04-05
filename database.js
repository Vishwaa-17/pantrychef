const mysql = require('mysql2');

// ✅ Configure database connection
const pool = mysql.createPool({
  host: 'localhost',        // Change if your database is on a remote server
  user: 'root',    // Replace with your MySQL username
  password: '17112005', // Replace with your MySQL password
  database: 'pantrychef',   // Ensure this matches your database name
  connectionLimit: 10,      // Maximum connections
});

// ✅ Check the database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL database!");
    connection.release();
  }
});

module.exports = pool;
