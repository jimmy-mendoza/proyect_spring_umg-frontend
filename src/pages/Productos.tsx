import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, Package, X, CheckCircle2, AlertCircle } from "lucide-react";

import {
  listarProductosActivos,
  crearProducto,
  actualizarProducto,
  anularProducto
} from "../services/productoService";

import type { Producto } from "../types/producto";

// Importaciones de shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const formInicial: Producto = {
  idProducto: null,
  nombre: "",
  descripcion: "",
  precio: 0,
  stock: 0,
  idCategoria: null
};

function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState<Producto>(formInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  const cargarProductos = async () => {
    try {
      const respuesta = await listarProductosActivos();
      setProductos(respuesta.data);
    } catch (error) {
      console.error("Error al listar productos", error);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const esNumerico = ["precio", "stock", "idCategoria"].includes(name);
    setForm((prev) => ({
      ...prev,
      [name]: esNumerico ? (value === "" ? "" : Number(value)) : value
    }));
  };

  const obtenerMensajeError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.mensaje ?? error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Ocurrió un error inesperado";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (modoEdicion && form.idProducto !== null) {
        await actualizarProducto(form.idProducto, form);
        setMensaje("Producto actualizado correctamente");
      } else {
        await crearProducto(form);
        setMensaje("Producto creado correctamente");
      }
      setEsError(false);
      setForm(formInicial);
      setModoEdicion(false);
      cargarProductos();
    } catch (error) {
      setEsError(true);
      setMensaje(obtenerMensajeError(error));
      console.error("Error al guardar producto", error);
    }
  };

  const handleModificar = (producto: Producto) => {
    setForm(producto);
    setModoEdicion(true);
    setMensaje("");
  };

  const handleCancelar = () => {
    setForm(formInicial);
    setModoEdicion(false);
    setMensaje("");
  };

  const handleAnular = async (idProducto: number) => {
    const confirmar = window.confirm("¿Seguro que deseas anular este producto?");
    if (!confirmar) return;
    try {
      await anularProducto(idProducto);
      setEsError(false);
      setMensaje("Producto anulado correctamente");
      cargarProductos();
    } catch (error) {
      setEsError(true);
      setMensaje(obtenerMensajeError(error));
      console.error("Error al anular el producto", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Encabezado Principal */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gestión de Productos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crea, edita y administra el inventario de tu catálogo.
          </p>
        </div>
      </div>

      {/* Banner de Notificación */}
      {mensaje && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg text-sm font-medium border ${
            esError
              ? "bg-destructive/10 text-destructive border-destructive/20"
              : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40"
          }`}
        >
          {esError ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <span>{mensaje}</span>
        </div>
      )}

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            {modoEdicion ? (
              <Pencil className="w-5 h-5 text-amber-500" />
            ) : (
              <Plus className="w-5 h-5 text-primary" />
            )}
            {modoEdicion ? "Modificar producto" : "Crear nuevo producto"}
          </CardTitle>
          <CardDescription>
            {modoEdicion
              ? "Edita los campos necesarios y guarda los cambios para actualizar el producto."
              : "Ingresa los datos del nuevo producto para añadirlo al inventario."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Nombre */}
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="nombre">Nombre del producto</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Ej. Teclado Mecánico RGB"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* ID Categoría */}
              <div className="space-y-2">
                <Label htmlFor="idCategoria">ID Categoría</Label>
                <Input
                  type="number"
                  id="idCategoria"
                  name="idCategoria"
                  placeholder="Ej. 1"
                  value={form.idCategoria ?? ""}
                  onChange={handleChange}
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2 lg:col-span-3">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder="Escribe detalles del producto..."
                  rows={2}
                  value={form.descripcion}
                  onChange={handleChange}
                />
              </div>

              {/* Precio */}
              <div className="space-y-2">
                <Label htmlFor="precio">Precio (Q)</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="precio"
                  name="precio"
                  placeholder="0.00"
                  value={form.precio}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <Label htmlFor="stock">Stock disponible</Label>
                <Input
                  type="number"
                  id="stock"
                  name="stock"
                  placeholder="0"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Acciones Formulario */}
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit">
                {modoEdicion ? "Guardar cambios" : "Crear producto"}
              </Button>
              {modoEdicion && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelar}
                  className="flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabla de Resultados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              Listado de Productos
            </CardTitle>
            <CardDescription className="mt-1">
              Actualmente tienes {productos.length}{" "}
              {productos.length === 1 ? "producto registrado" : "productos registrados"}.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {productos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
              <p className="font-medium">No hay productos registrados todavía</p>
              <p className="text-sm opacity-75">
                Agrega uno utilizando el formulario superior.
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.map((producto) => (
                    <TableRow key={producto.idProducto}>
                      <TableCell className="font-mono text-muted-foreground text-xs">
                        #{producto.idProducto}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {producto.nombre}
                        </div>
                        {producto.descripcion && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {producto.descripcion}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          Cat. {producto.idCategoria ?? "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Q{Number(producto.precio).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={producto.stock > 0 ? "outline" : "destructive"}
                        >
                          {producto.stock} un.
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Modificar"
                            onClick={() => handleModificar(producto)}
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Anular"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              producto.idProducto !== null &&
                              handleAnular(producto.idProducto)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Productos;