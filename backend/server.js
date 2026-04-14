const express = require("express");
const cors = require("cors");
const db = require("./db");
const ExcelJS = require("exceljs");
const multer = require("multer");
const upload = multer({

storage: multer.diskStorage({

destination: function (req, file, cb) {

cb(null, "/tmp"); // dossier toujours autorisé sur Railway

},

filename: function (req, file, cb) {

cb(null, Date.now() + "-" + file.originalname);

}

})

});

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

if(err){

console.log("ERREUR SQL /api/jeux");
console.log(err);

/* on renvoie tableau vide pour éviter crash React */
return res.json([]);

}

res.json(result || []);

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

app.post("/api/import", upload.single("file"), async (req,res)=>{

try{

if(!req.file){

return res.status(400).json({
message:"aucun fichier reçu"
});

}

const workbook = new ExcelJS.Workbook();

await workbook.xlsx.readFile(req.file.path);

const sheet = workbook.worksheets[0];

if(!sheet){

return res.status(400).json({
message:"excel vide"
});

}

for(let i=2;i<=sheet.rowCount;i++){

const row = sheet.getRow(i);

let nom = row.getCell(1).text;
let ean = row.getCell(2).text;

/* nettoyage */

nom = String(nom).trim();

ean = String(ean)
.replace(/\s/g,"")
.replace(/[^0-9]/g,"")
.padStart(13,"0");

if(!nom || ean.length !== 13) continue;

console.log("IMPORT OK :", nom, ean);

/* nettoyage */

nom = String(nom || "").trim();

ean = String(ean || "")
.replace(/\s/g,"")
.replace(/\D/g,"")
.padStart(13,"0");

/* sécurise valeurs excel */

if(typeof nom === "object" && nom?.richText){
nom = nom.richText.map(t=>t.text).join("");
}

if(typeof ean === "object" && ean?.richText){
ean = ean.richText.map(t=>t.text).join("");
}

ean = String(ean)
.trim()
.replace(/\D/g,"")
.padStart(13,"0");

if(!nom || !ean) continue;


/* trouver ou créer jeu */

const jeu_id = await new Promise((resolve,reject)=>{

db.query(
"SELECT id FROM jeux WHERE nom=?",
[nom],
(err,result)=>{

if(err) return reject(err);

if(result.length){

resolve(result[0].id);

}else{

db.query(
"INSERT INTO jeux(nom) VALUES(?)",
[nom],
(err,result2)=>{

if(err) return reject(err);

resolve(result2.insertId);

}
);

}

}
);

});


/* ajouter ean */

await new Promise(resolve=>{

db.query(
"INSERT IGNORE INTO codes_barres(jeu_id,ean13) VALUES(?,?)",
[jeu_id,ean],
()=>resolve()
);

});

}

res.json({
message:"import ok"
});

}catch(err){

console.log("ERREUR IMPORT");
console.log(err);

res.status(500).json({
message:"erreur import"
});

}

});

const PORT = process.env.PORT || 3001;

app.listen(PORT, ()=>{

console.log("serveur lancé sur port " + PORT);

});