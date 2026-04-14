import { Link, Outlet } from "react-router-dom";
import logo from "../assets/Logo.jpg";

export default function Layout(){

return (

<div>

<nav className="topbar">

<div className="logo">

<img src={logo} />

<span>GDS Festyjeux</span>

</div>

<div className="menu">

<Link to="/">Jeux</Link>

<Link to="/retour">Retour jeux</Link>

<Link to="/historique">Historique</Link>

</div>

</nav>

<div className="page">

<Outlet/>

</div>

</div>

);

}