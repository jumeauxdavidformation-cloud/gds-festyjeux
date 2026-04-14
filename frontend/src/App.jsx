import { BrowserRouter, Routes, Route } from "react-router-dom";

import Jeux from "./pages/Jeux.jsx";
import Retour from "./pages/Retour.jsx";
import Historique from "./pages/Historique.jsx";
import Layout from "./components/Layout.jsx";

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Layout />}>

          <Route index element={<Jeux />} />

          <Route path="retour" element={<Retour />} />

          <Route path="historique" element={<Historique />} />

        </Route>

      </Routes>

    </BrowserRouter>

  );

}