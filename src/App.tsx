import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Categorias from "./pages/Categoria";
import Clientes from "./pages/Clientes";
import Productos from "./pages/Productos";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/categorias" replace />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/productos" element={<Productos />} />
        <Route
          path="*"
          element={<div className="p-6">Página no encontrada</div>}
        />
      </Route>
    </Routes>
  );
}

export default App;
