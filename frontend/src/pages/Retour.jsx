import { useState, useRef } from "react";

export default function Retour(){

const [message,setMessage] = useState("");

const inputRef = useRef(null);


const envoyerScan = async (ean)=>{

if(!ean) return;

const res = await fetch("http://localhost:3001/api/scan",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

ean

})

});

const data = await res.json();

setMessage(data.message);

inputRef.current.value="";

inputRef.current.focus();

};


const handleKey = (e)=>{

if(e.key === "Enter"){

envoyerScan(e.target.value);

}

};


return (

<div>

<h1>Retour jeux</h1>

<p>Scanner le code barre du jeu quand il revient</p>

<input

ref={inputRef}

autoFocus

placeholder="scanner EAN13"

onKeyDown={handleKey}

style={{

fontSize:"20px",
padding:"10px",
width:"300px"

}}

/>

<p>{message}</p>

</div>

);

}