const mysql = require("mysql2");

const isRailway = !!process.env.MYSQLHOST;

const db = mysql.createPool(

isRailway
? {

/* CONFIG RAILWAY */

host: process.env.MYSQLHOST,
user: process.env.MYSQLUSER,
password: process.env.MYSQLPASSWORD,
database: process.env.MYSQLDATABASE,
port: process.env.MYSQLPORT,

ssl: {
rejectUnauthorized: false
}

}

: {

/* CONFIG LOCAL */

host:"localhost",
user:"root",
password:"",
database:"gds_festyjeux"

}

);


/* test connexion */

db.getConnection((err,conn)=>{

if(err){

console.log("ERREUR MYSQL");
console.log(err);

}else{

console.log("MYSQL CONNECTE");

conn.release();

}

});

module.exports = db;
