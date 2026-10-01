import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import {
  Plus,
  Pencil,
  Trash2,
  Folder,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  listarCategoriasActivas,
  crearCategoria,
  actualizarCategoria,
  anularCategoria,
} from "../services/categoriaService";

import type { Categoria } from "../types/categoria";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
import ExcelJS from "exceljs";

const formInicial: Categoria = {
  idCategoria: null,
  nombre: "",
  descripcion: "",
};

function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<Categoria>(formInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  const cargarCategorias = async () => {
    try {
      const respuesta = await listarCategoriasActivas();
      setCategorias(respuesta.data);
    } catch (error) {
      console.error("Error al listar categorias", error);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      if (modoEdicion && form.idCategoria !== null) {
        await actualizarCategoria(form.idCategoria, form);
        setMensaje("Categoría actualizada correctamente");
      } else {
        await crearCategoria(form);
        setMensaje("Categoría creada correctamente");
      }
      setEsError(false);
      setForm(formInicial);
      setModoEdicion(false);
      cargarCategorias();
    } catch (error) {
      setEsError(true);
      setMensaje(obtenerMensajeError(error));
      console.error("Error al guardar categoría", error);
    }
  };

  const handleModificar = (categoria: Categoria) => {
    setForm(categoria);
    setModoEdicion(true);
    setMensaje("");
  };

  const handleCancelar = () => {
    setForm(formInicial);
    setModoEdicion(false);
    setMensaje("");
  };

  const handleAnular = async (idCategoria: number) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas anular esta categoría?",
    );
    if (!confirmar) return;
    try {
      await anularCategoria(idCategoria);
      setEsError(false);
      setMensaje("Categoría anulada correctamente");
      cargarCategorias();
    } catch (error) {
      setEsError(true);
      setMensaje(obtenerMensajeError(error));
      console.error("Error al anular la categoría", error);
    }
  };

  // Función helper para construir el documento jsPDF
  const generarPDF = () => {
    const doc = new jsPDF();

    // Título del reporte
    doc.text("Listado de Categorías", 14, 15);

    // Preparar los datos
    const columnas = ["Nombre", "Descripción"];
    const filas = categorias.map((categoria) => [
      categoria.nombre,
      categoria.descripcion,
    ]);

    // Dibujar la tabla
    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 20,
    });

    return doc;
  };

  // Descargar el PDF directamente
  const exportarPDF = () => {
    const doc = generarPDF();
    doc.save("categorias.pdf");
  };

  // Abrir el PDF en una pestaña nueva
  const verPDF = () => {
    const doc = generarPDF();
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  // Descargar el reporte como archivo Excel
  const exportarExcel = async () => {
    // 1. Crear el libro y la hoja
    const libro = new ExcelJS.Workbook();
    const hoja = libro.addWorksheet("Categorías");

    // 2. Título y fecha
    hoja.addRow(["Listado de Categorías"]).font = { size: 16, bold: true };
    hoja.addRow(["Fecha: " + new Date().toLocaleDateString()]);
    hoja.addRow([]); // fila vacía de separación

    // 3. Encabezados de la tabla (mismos colores que el PDF)
    const encabezado = hoja.addRow(["Nombre", "Descripción"]);
    encabezado.eachCell((celda) => {
      celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
      celda.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF166534" },
      };
      celda.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // 4. Filas de datos
    categorias.forEach((categoria, indice) => {
      const fila = hoja.addRow([categoria.nombre, categoria.descripcion]);
      fila.eachCell((celda) => {
        celda.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        // filas alternadas en verde claro, como en el PDF
        if (indice % 2 === 1) {
          celda.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDCFCE7" },
          };
        }
      });
    });

    // 5. Ancho de columnas
    hoja.getColumn(1).width = 30;
    hoja.getColumn(2).width = 60;

    // 6. Generar el archivo y descargarlo
    const buffer = await libro.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "categorias.xlsx";
    enlace.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Encabezado Principal */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground animate-blurred-fade-in animate-duration-slow">
            Gestión de Categorías
          </h1>
          <p className="text-sm text-muted-foreground mt-1 animate-blurred-fade-in animate-duration-slow">
            Crea, edita y administra las categorías de tus productos.
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
      <Card className="animate-slide-in-left ">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            {modoEdicion ? (
              <Pencil className="w-5 h-5 text-amber-500" />
            ) : (
              <Plus className="w-5 h-5 text-primary" />
            )}
            {modoEdicion ? "Modificar categoría" : "Crear nueva categoría"}
          </CardTitle>
          <CardDescription>
            {modoEdicion
              ? "Edita los campos necesarios y guarda los cambios para actualizar la categoría."
              : "Ingresa los datos de la nueva categoría para organizarla en el sistema."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la categoría</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Ej. Periféricos, Electrónica, etc."
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder="Escribe una breve descripción de la categoría..."
                  rows={2}
                  value={form.descripcion}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Acciones Formulario */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                className="bg-slate-800 flex items-center gap-1 cursor-pointer"
              >
                {modoEdicion ? "Guardar cambios" : "Crear categoría"}
              </Button>
              {modoEdicion && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelar}
                  className="flex items-center gap-1 cursor-pointer"
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
        <CardHeader className="flex items-center justify-start ">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Folder className="w-5 h-5 text-muted-foreground" />
              Listado de Categorías
            </CardTitle>
            <CardDescription className="mt-1">
              Actualmente tienes {categorias.length}{" "}
              {categorias.length === 1
                ? "categoría registrada"
                : "categorías registradas"}
              .
            </CardDescription>

            <div className="mt-2 gap-6">
              <button
                onClick={exportarPDF}
                className="bg-slate-800 transition hover:bg-sky-700 text-white font-bold py-2 px-4 rounded mb-4 cursor-pointer"
              >
                Exportar a PDF
              </button>

              <button
                onClick={exportarExcel}
                className="bg-slate-800 transition hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 ml-2 cursor-pointer"
              >
                Exportar a Excel
              </button>
              <button
                onClick={verPDF}
                className="bg-slate-800 transition hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mb-4 ml-2 cursor-pointer"
              >
                Ver PDF
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {categorias.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Folder className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
              <p className="font-medium">
                No hay categorías registradas todavía
              </p>
              <p className="text-sm opacity-75">
                Agrega una utilizando el formulario superior.
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorias.map((categoria) => (
                    <TableRow key={categoria.idCategoria}>
                      <TableCell className="font-mono text-muted-foreground text-xs">
                        #{categoria.idCategoria}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {categoria.nombre}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {categoria.descripcion || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Modificar"
                            className={"cursor-pointer "}
                            onClick={() => handleModificar(categoria)}
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Anular"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            onClick={() =>
                              categoria.idCategoria !== null &&
                              handleAnular(categoria.idCategoria)
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

export default Categorias;
