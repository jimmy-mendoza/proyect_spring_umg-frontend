import api from '../api/axios';
import type { Producto } from '../types/producto';

export const listarProductosActivos = () =>
    api.get<Producto[]>("/productos/activos");

export const crearProducto = (data: Omit<Producto, "idProducto">) =>
    api.post<Producto>("/productos", data);

export const actualizarProducto = (id: number, data: Omit<Producto, "idProducto">) =>
    api.put<Producto>(`/productos/${id}`, data);

export const anularProducto = (id: number) =>
    api.put<Producto>(`/productos/${id}/anular`);