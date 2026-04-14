import { useState, useEffect } from "react";

export default function Jeux(){

const [nom,setNom] = useState("");
const [ean,setEan] = useState("");

const [jeux,setJeux] = useState([]);

const chargerJeux = async ()=>{

const res = await fetch("https://gds-festyjeux-production.up.railway.app/api/jeux");
const data = await res.json();

setJeux(Array.isArray(data) ? data : []);

};


useEffect(()=>{

chargerJeux();

},[]);



const ajouterJeu = async ()=>{

if(!nom || !ean) return;

await fetch("https://gds-festyjeux-production.up.railway.app/api/jeux",{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

nom,
ean

})

});

setNom("");
setEan("");

chargerJeux();

};



/* grouper par jeu */

const jeuxGroupes = {};

jeux.forEach(j=>{

if(!jeuxGroupes[j.nom]){

jeuxGroupes[j.nom] = [];

}

jeuxGroupes[j.nom].push(j.ean13);

});

const importerExcel = async (e)=>{

const file = e.target.files[0];

const formData = new FormData();

formData.append("file",file);

await fetch("https://gds-festyjeux-production.up.railway.app/api/import",{

method:"POST",

body:formData

});

chargerJeux();

};


return (

<div>

<h1>Jeux</h1>


{/* AJOUT JEU */}

<div className="section">

<h3>Ajouter un jeu</h3>

<div className="form">

<input
placeholder="Nom du jeu"
value={nom}
onChange={(e)=>setNom(e.target.value)}
/>

<input
placeholder="EAN13"
value={ean}
onChange={(e)=>setEan(e.target.value)}
/>

<button onClick={ajouterJeu}>
Ajouter
</button>

</div>

</div>



{/* IMPORT EXCEL */}

<div className="section">

<h3>Importer Excel</h3>

<input
type="file"
onChange={importerExcel}
/>

</div>



{/* LISTE JEUX */}

<div className="section">

<h3>Liste des jeux</h3>

{Object.keys(jeuxGroupes).map(nom => (

<div key={nom} className="card">

<b>{nom}</b>

<ul>

{jeuxGroupes[nom].map(e => (

<li key={e}>{e}</li>

))}

</ul>

</div>

))}

</div>



</div>

);}