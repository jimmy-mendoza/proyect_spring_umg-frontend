export interface Producto {
    idProducto: number | null;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    estado?: boolean;
    idCategoria: number | null;
}