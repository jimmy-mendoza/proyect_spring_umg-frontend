import { useEffect,useState, type ChangeEvent } from "react";
import axios from "axios";

import {
    listarCategoriasActivas,
    crearCategoria,
    actualizarCategoria,
    anularCategoria
} from "../services/categoriaService"

import type { Categoria } from "../types/categoria";

// Estado inicial
const formInicial: Categoria = {
    idCategoria: null,
    nombre: "",
    descripcion: ""
}


function Categorias() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [form, setForm] = useState<Categoria>(formInicial);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const cargarCategorias = async () => {
        try {
            const respuesta = await listarCategoriasActivas()
            setCategorias(respuesta.data)
        }catch(error){
            console.error("Error al listar categorias", error)
        }
    }

    useEffect(() => {
        cargarCategorias()
    }, []);
    
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    }

    return (
      <div>
        <h2>Ingresar/Modificar Categorías</h2>
        {mensaje && <p>{mensaje}</p>}
        <form>
          <div>
            <label htmlFor="nombre">Nombre:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="descripcion">Descripción:</label>
            <input
              type="text"
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
            />
          </div>
          <button type="submit">Guardar</button>
        </form>
        <h2>Listado de Categorías</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Modificar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.idCategoria}>
                <td>{categoria.nombre}</td>
                <td>{categoria.descripcion}</td>
                <td>
                  <button>Modificar</button>
                </td>
                <td>
                  <button>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
}
export default Categorias

