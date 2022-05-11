require('dotenv').config();
const mysql = require('mysql');
const pool = mysql.createPool({
    connectionLimit: 10,  
    waitForConnections: true,
    queueLimit: 0,
    multipleStatements: true,
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    port : process.env.DB_PORT,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE,
});

pool.on('acquire', function (connection) {
  console.log('Connection %d acquired', connection.threadId);
});

module.exports = pool;