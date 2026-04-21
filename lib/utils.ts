import { type ClassValue, clsx } from 'clsx';
import { Unidad, EstadoPedido } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const UNIDADES: Unidad[] = ['m2', 'ml', 'caja', 'pieza', 'saco', 'palet', 'ud'];

export const UNIDAD_LABELS: Record<Unidad, string> = {
  m2: 'm²',
  ml: 'ml',
  caja: 'Cajas',
  pieza: 'Piezas',
  saco: 'Sacos',
  palet: 'Palets',
  ud: 'Unidades',
};

export const ESTADO_LABELS: Record<EstadoPedido, string> = {
  pendiente: 'Pendiente',
  preparando: 'Preparando',
  listo: 'Listo',
  entregado: 'Entregado',
};

export const ESTADO_COLORS: Record<EstadoPedido, string> = {
  pendiente: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  preparando: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  listo: 'text-green-400 bg-green-400/10 border-green-400/20',
  entregado: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
};

export function formatStock(cantidad: number, unidad: Unidad): string {
  return `${cantidad} ${UNIDAD_LABELS[unidad]}`;
}

export function ubicacionLabel(fila: string, estanteria: string, nivel: string): string {
  return `F${fila} · E${estanteria} · N${nivel}`;
}
