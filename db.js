const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'knu_sw!!',
    database: 'todo'
});

module.exports = db;