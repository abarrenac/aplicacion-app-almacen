export type Unidad = 'm2' | 'ml' | 'caja' | 'pieza' | 'saco' | 'palet' | 'ud';

export type EstadoPedido = 'pendiente' | 'preparando' | 'listo' | 'entregado';

export interface Producto {
  id: string;
  referencia: string;
  nombre: string;
  categoria: string;
  unidad: Unidad;
  stock_actual: number;
  stock_minimo: number;
  fila: string;
  estanteria: string;
  nivel: string;
  proveedor?: string;
  precio_coste?: number;
  qr_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Pedido {
  id: string;
  numero_pedido: string;
  nombre: string;
  apellidos: string;
  dni?: string;
  empresa?: string;
  telefono?: string;
  referencia_obra?: string;
  fecha: string;
  estado: EstadoPedido;
  notas?: string;
  created_at: string;
  lineas?: LineaPedido[];
}

export interface LineaPedido {
  id: string;
  pedido_id: string;
  producto_ref: string;
  cantidad: number;
  unidad: Unidad;
  recogido: boolean;
  producto?: Producto;
}

export interface MovimientoStock {
  id: string;
  producto_ref: string;
  pedido_numero?: string;
  cantidad_cambio: number;
  stock_anterior: number;
  stock_nuevo: number;
  motivo: string;
  created_at: string;
}
