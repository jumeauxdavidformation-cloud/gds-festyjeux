import { useEffect, useState } from "react";

export default function Historique(){

const [data,setData] = useState([]);

const chargerHistorique = async ()=>{

const res = await fetch("http://localhost:3001/api/historique");

const json = await res.json();

setData(json);

};

useEffect(()=>{

chargerHistorique();

},[]);


const exporterExcel = ()=>{

window.open("http://localhost:3001/api/export");

};


return (

<div>

<h1>Historique</h1>

<button onClick={exporterExcel}>

Exporter Excel

</button>


<table border="1" cellPadding="5" style={{marginTop:"20px"}}>

<thead>

<tr>

<th>Jeu</th>

<th>Nombre parties</th>

</tr>

</thead>


<tbody>

{data.map((j,i)=> (

<tr key={i}>

<td>{j.nom}</td>

<td>{j.total}</td>

</tr>

))}

</tbody>

</table>

</div>

);

}