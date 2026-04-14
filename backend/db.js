const mysql = require("mysql2");

const db = mysql.createPool({

host: process.env.MYSQLHOST,
user: process.env.MYSQLUSER,
password: process.env.MYSQLPASSWORD,
database: process.env.MYSQLDATABASE,
port: process.env.MYSQLPORT,

waitForConnections: true,
connectionLimit: 10,
queueLimit: 0

});

db.getConnection((err, connection)=>{

if(err){

console.log("ERREUR MYSQL");
console.log(err);

}else{

console.log("MYSQL CONNECTE");

connection.release();

}

});

module.exports = db;