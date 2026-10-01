import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  listarClientesActivos,
  crearCliente,
  actualizarCliente,
  anularCliente,
} from "../services/clienteService";

import type { Cliente } from "../types/cliente";

const formInicial: Cliente = {
  idCliente: null,
  nombre: "",
  apellido: "",
  telefono: "",
  email: "",
};

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<Cliente>(formInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargarClientes = async () => {
    try {
      const respuesta = await listarClientesActivos();
      setClientes(respuesta.data);
    } catch (error) {
      console.error("Error al listar clientes", error);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      if (modoEdicion && form.idCliente !== null) {
        await actualizarCliente(form.idCliente, form);
        setMensaje("Cliente actualizado correctamente");
      } else {
        await crearCliente(form);
        setMensaje("Cliente creado correctamente");
      }
      setForm(formInicial);
      setModoEdicion(false);
      cargarClientes();
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
      console.error("Error al guardar cliente", error);
    }
  };

  const handleModificar = (cliente: Cliente) => {
    setForm(cliente);
    setModoEdicion(true);
  };

  const handleCancelar = () => {
    setForm(formInicial);
    setModoEdicion(false);
  };

  const handleAnular = async (idCliente: number) => {
    const confirmar = window.confirm("¿Seguro que deseas anular este cliente?");
    if (!confirmar) return;
    try {
      await anularCliente(idCliente);
      setMensaje("Cliente anulado correctamente");
      cargarClientes();
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
      console.error("Error al anular el cliente", error);
    }
  };

  // Helper para construir el documento jsPDF de Clientes
  const generarPDF = () => {
    const doc = new jsPDF();

    // Título del reporte
    doc.text("Listado de Clientes", 14, 15);

    // Definición de columnas y filas
    const columnas = ["Nombre", "Apellido", "Teléfono", "Email"];
    const filas = clientes.map((cliente) => [
      cliente.nombre,
      cliente.apellido,
      cliente.telefono,
      cliente.email,
    ]);

    // Generar tabla con autoTable
    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 20,
    });

    return doc;
  };

  // Exportar/Descargar PDF
  const exportarPDF = () => {
    const doc = generarPDF();
    doc.save("clientes.pdf");
  };

  // Visualizar PDF en pestaña nueva
  const verPDF = () => {
    const doc = generarPDF();
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  // Exportar a Excel
  const exportarExcel = async () => {
    const libro = new ExcelJS.Workbook();
    const hoja = libro.addWorksheet("Clientes");

    // Título y fecha
    hoja.addRow(["Listado de Clientes"]).font = { size: 16, bold: true };
    hoja.addRow(["Fecha: " + new Date().toLocaleDateString()]);
    hoja.addRow([]);

    // Encabezados
    const encabezado = hoja.addRow(["Nombre", "Apellido", "Teléfono", "Email"]);
    encabezado.eachCell((celda) => {
      celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
      celda.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E293B" }, // Color Slate
      };
      celda.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Filas de datos
    clientes.forEach((cliente, indice) => {
      const fila = hoja.addRow([
        cliente.nombre,
        cliente.apellido,
        cliente.telefono,
        cliente.email,
      ]);
      fila.eachCell((celda) => {
        celda.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (indice % 2 === 1) {
          celda.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF1F5F9" },
          };
        }
      });
    });

    // Anchos de columna
    hoja.getColumn(1).width = 25;
    hoja.getColumn(2).width = 25;
    hoja.getColumn(3).width = 20;
    hoja.getColumn(4).width = 35;

    // Generar y descargar archivo
    const buffer = await libro.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "clientes.xlsx";
    enlace.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6 animate-blurred-fade-in animate-duration-slow">
        Clientes
      </h1>

      {mensaje && (
        <div className="mb-4 px-4 py-2 rounded-md bg-slate-100 text-slate-700 text-sm">
          {mensaje}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-lg p-5 mb-8 animate-slide-in-left"
      >
        <h2 className="text-sm font-medium mb-4">
          {modoEdicion ? "Modificar cliente" : "Nuevo cliente"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="nombre" className="text-sm ">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="apellido" className="text-sm ">
              Apellido
            </label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="telefono" className="text-sm ">
              Teléfono
            </label>
            <input
              type="text"
              id="telefono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm ">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            type="submit"
            className="bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {modoEdicion ? "Guardar cambios" : "Crear cliente"}
          </button>
          {modoEdicion && (
            <button
              type="button"
              onClick={handleCancelar}
              className="text-sm text-slate-500 px-4 py-2 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-slate-500">
          {clientes.length} {clientes.length === 1 ? "cliente" : "clientes"}
        </h2>

        <div className="flex gap-2">
          <button
            onClick={exportarPDF}
            className="bg-slate-800 transition hover:bg-sky-700 text-white font-medium py-1.5 px-3 rounded text-sm cursor-pointer"
          >
            Exportar PDF
          </button>
          <button
            onClick={exportarExcel}
            className="bg-slate-800 transition hover:bg-emerald-700 text-white font-medium py-1.5 px-3 rounded text-sm cursor-pointer"
          >
            Exportar Excel
          </button>
          <button
            onClick={verPDF}
            className="bg-slate-800 transition hover:bg-indigo-700 text-white font-medium py-1.5 px-3 rounded text-sm cursor-pointer"
          >
            Ver PDF
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {clientes.map((cliente) => (
          <div
            key={cliente.idCliente}
            className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">
                {cliente.nombre} {cliente.apellido}
              </p>
              <p className="text-sm text-slate-500">
                {cliente.email} · {cliente.telefono}
              </p>
            </div>

            <div className="flex justify-end gap-1">
              <Button
                size="icon"
                variant="ghost"
                title="Modificar"
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                onClick={() => handleModificar(cliente)}
              >
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                title="Anular"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                onClick={() =>
                  cliente.idCliente !== null && handleAnular(cliente.idCliente)
                }
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {clientes.length === 0 && (
          <p className="text-sm text-slate-400 py-6 text-center">
            No hay clientes registrados todavía.
          </p>
        )}
      </div>
    </div>
  );
}
export default Clientes;
