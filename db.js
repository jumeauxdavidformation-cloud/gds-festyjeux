const mysql = require("mysql2");

const db = mysql.createConnection({

host:"localhost",
user:"root",
password:"",
database:"gds_festyjeux"

});

db.connect((err)=>{

if(err){

console.log(err);

}else{

console.log("connecté à gds_festyjeux");

}

});

module.exports = db;