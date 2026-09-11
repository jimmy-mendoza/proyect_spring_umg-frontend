import { Route,Routes } from "react-router-dom";
import Categorias from "./pages/Categoria";
import Clientes from "./pages/Clientes";
import Productos from "./pages/Productos";

function App () {
    return(
        <Routes>
            <Route path="/categorias" element={<Categorias/>} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="*" element={<div>Página no encontrada</div>} />
        </Routes>
    )
}
export default App
