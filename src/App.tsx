import { Route,Routes } from "react-router-dom";
import Categorias from "./pages/Categoria";

function App () {
    return(
        <Routes>
            <Route path="/categorias" element={<Categorias/>} />
        </Routes>
    )
}
export default App
