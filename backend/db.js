const mysql = require("mysql2");

const db = mysql.createConnection({

host:"crossover.proxy.rlwy.net",
user:"root",
password:"ECLZQkvJzdCGwmPOkWTJoaVGBXvzGdTc",
database:"railway",
port: 16262

});

db.connect((err)=>{

if(err){

console.log(err);

}else{

console.log("connecté à gds_festyjeux");

}

});

module.exports = db;