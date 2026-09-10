import { Route,Routes } from "react-router-dom";
import Categorias from "./pages/Categoria";

function App () {
    return(
        <Routes>
            <Route path="/categorias" element={<Categorias/>} />
            <Route path="*" element={<div>Página no encontrada</div>} />
        </Routes>
    )
}
export default App
