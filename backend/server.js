const express = require("express");
const cors = require("cors");
const db = require("./db");
const ExcelJS = require("exceljs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended:true }));

app.get("/", (req,res)=>{

res.send("API Festyjeux ok");

});
app.post("/api/jeux", (req,res)=>{

const { nom, ean } = req.body;


/* 1 vérifier si jeu existe */

const sqlJeu = "SELECT id FROM jeux WHERE nom = ?";

db.query(sqlJeu,[nom],(err,result)=>{

if(err) return res.status(500).json(err);


let jeu_id;


/* si jeu existe */

if(result.length > 0){

jeu_id = result[0].id;

ajouterCodeBarre();


}else{


/* sinon créer jeu */

const sqlInsertJeu = "INSERT INTO jeux (nom) VALUES (?)";

db.query(sqlInsertJeu,[nom],(err,result2)=>{

if(err) return res.status(500).json(err);

jeu_id = result2.insertId;

ajouterCodeBarre();

});

}


/* ajouter ean13 */

function ajouterCodeBarre(){

const sqlEAN = "INSERT INTO codes_barres (jeu_id,ean13) VALUES (?,?)";

db.query(sqlEAN,[jeu_id,ean],(err)=>{

if(err){

return res.json({

message:"EAN déjà existant"

});

}

res.json({

message:"jeu ajouté"

});

});

}


});

});
/* récupérer liste jeux */

app.get("/api/jeux",(req,res)=>{

const sql = `

SELECT 

jeux.id,
jeux.nom,
codes_barres.ean13

FROM jeux

LEFT JOIN codes_barres
ON jeux.id = codes_barres.jeu_id

ORDER BY jeux.nom

`;

db.query(sql,(err,result)=>{

if(err) return res.status(500).json(err);

res.json(result);

});

});
/* scan retour jeu */

app.post("/api/scan",(req,res)=>{

const { ean } = req.body;


/* trouver jeu correspondant */

const sql = `

SELECT jeu_id
FROM codes_barres
WHERE ean13 = ?

`;

db.query(sql,[ean],(err,result)=>{

if(err) return res.status(500).json(err);

if(result.length === 0){

return res.json({

message:"jeu inconnu"

});

}

const jeu_id = result[0].jeu_id;


/* ajouter utilisation */

const sqlInsert = `

INSERT INTO utilisations (jeu_id)
VALUES (?)

`;

db.query(sqlInsert,[jeu_id],(err)=>{

if(err) return res.status(500).json(err);

res.json({

message:"scan enregistré"

});

});

});

});

/* historique utilisations */

app.get("/api/historique",(req,res)=>{

const sql = `

SELECT 

jeux.nom,

COUNT(utilisations.id) as total

FROM jeux

LEFT JOIN utilisations
ON jeux.id = utilisations.jeu_id

GROUP BY jeux.id

ORDER BY total DESC

`;

db.query(sql,(err,result)=>{

if(err) return res.status(500).json(err);

res.json(result);

});

});

app.get("/api/export",(req,res)=>{

const sql = `

SELECT 

jeux.nom,

COUNT(utilisations.id) as total

FROM jeux

LEFT JOIN utilisations
ON jeux.id = utilisations.jeu_id

GROUP BY jeux.id

ORDER BY total DESC

`;

db.query(sql, async (err,result)=>{

if(err) return res.status(500).json(err);


const workbook = new ExcelJS.Workbook();

const sheet = workbook.addWorksheet("historique");


sheet.columns = [

{ header:"Jeu", key:"nom" },

{ header:"Nombre parties", key:"total" }

];


result.forEach(r=>{

sheet.addRow(r);

});


res.setHeader(

"Content-Type",

"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

);

res.setHeader(

"Content-Disposition",

"attachment; filename=historique.xlsx"

);


await workbook.xlsx.write(res);

res.end();

});

});

/* import excel jeux */

/* import excel jeux */

app.post("/api/import", upload.single("file"), async (req,res)=>{

try{

const workbook = new ExcelJS.Workbook();

await workbook.xlsx.readFile(req.file.path);

const sheet = workbook.worksheets[0];

for(let i=2;i<=sheet.rowCount;i++){

const nom = sheet.getRow(i).getCell(1).value;
const ean = sheet.getRow(i).getCell(2).value;

if(!nom || !ean) continue;


/* vérifier si jeu existe */

const jeu_id = await new Promise((resolve,reject)=>{

const sqlJeu = "SELECT id FROM jeux WHERE nom = ?";

db.query(sqlJeu,[nom],(err,result)=>{

if(err) reject(err);

if(result.length > 0){

resolve(result[0].id);

}else{

const sqlInsert = "INSERT INTO jeux (nom) VALUES (?)";

db.query(sqlInsert,[nom],(err,result2)=>{

if(err) reject(err);

resolve(result2.insertId);

});

}

});

});


/* ajouter code barre */

await new Promise((resolve)=>{

const sqlEAN = `
INSERT IGNORE INTO codes_barres (jeu_id,ean13)
VALUES (?,?)
`;

db.query(sqlEAN,[jeu_id,ean],()=>{

resolve();

});

});

}

res.json({

message:"import ok"

});

}catch(err){

console.log(err);

res.status(500).json(err);

}

});

const PORT = process.env.PORT || 3001;

app.listen(PORT, ()=>{

console.log("serveur lancé sur port " + PORT);

});