export interface Cliente {
  idCliente: number | null;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  estado?: boolean;
  fechaRegistro?: string;
}
