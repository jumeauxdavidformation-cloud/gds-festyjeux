const mysql = require("mysql2");

const db = mysql.createConnection({

host: process.env.MYSQLHOST,
user: process.env.MYSQLUSER,
password: process.env.MYSQLPASSWORD,
database: process.env.MYSQLDATABASE,
port: process.env.MYSQLPORT

});

db.connect((err)=>{

if(err){

console.log("erreur connexion mysql");
console.log(err);

}else{

console.log("connecté à mysql railway");

}

});

module.exports = db;