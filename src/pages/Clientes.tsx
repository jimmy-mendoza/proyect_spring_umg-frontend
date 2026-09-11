import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";

import {
    listarClientesActivos,
    crearCliente,
    actualizarCliente,
    anularCliente
} from "../services/clienteService";

import type { Cliente } from "../types/cliente";

const formInicial: Cliente = {
    idCliente: null,
    nombre: "",
    apellido: "",
    telefono: "",
    email: ""
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

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-semibold text-slate-800 mb-6">Clientes</h1>

            {mensaje && (
                <div className="mb-4 px-4 py-2 rounded-md bg-slate-100 text-slate-700 text-sm">
                    {mensaje}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="bg-white border border-slate-200 rounded-lg p-5 mb-8"
            >
                <h2 className="text-sm font-medium text-slate-500 mb-4">
                    {modoEdicion ? "Modificar cliente" : "Nuevo cliente"}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="nombre" className="text-sm text-slate-600">Nombre</label>
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
                        <label htmlFor="apellido" className="text-sm text-slate-600">Apellido</label>
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
                        <label htmlFor="telefono" className="text-sm text-slate-600">Teléfono</label>
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
                        <label htmlFor="email" className="text-sm text-slate-600">Email</label>
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
                        className="bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-slate-700 transition-colors"
                    >
                        {modoEdicion ? "Guardar cambios" : "Crear cliente"}
                    </button>
                    {modoEdicion && (
                        <button
                            type="button"
                            onClick={handleCancelar}
                            className="text-sm text-slate-500 px-4 py-2 rounded-md hover:bg-slate-100 transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <h2 className="text-sm font-medium text-slate-500 mb-3">
                {clientes.length} {clientes.length === 1 ? "cliente" : "clientes"}
            </h2>

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

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => handleModificar(cliente)}
                                className="text-sm text-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
                            >
                                Modificar
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    cliente.idCliente !== null && handleAnular(cliente.idCliente)
                                }
                                className="text-sm text-red-600 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                            >
                                Anular
                            </button>
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