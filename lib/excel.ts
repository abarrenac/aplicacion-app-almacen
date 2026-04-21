import * as XLSX from 'xlsx';
import { Producto, Pedido, LineaPedido, Unidad } from '@/types';

export interface ImportResult<T> {
  data: T[];
  errors: string[];
  warnings: string[];
}

const UNIDADES_VALIDAS: Unidad[] = ['m2', 'ml', 'caja', 'pieza', 'saco', 'palet', 'ud'];

export function parseExcelProductos(file: File): Promise<ImportResult<Partial<Producto>>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { raw: false });

      const errors: string[] = [];
      const warnings: string[] = [];
      const productos: Partial<Producto>[] = [];

      rows.forEach((row, i) => {
        const num = i + 2;
        const ref = row['referencia'] || row['Referencia'] || row['REF'] || row['ref'];
        const nombre = row['nombre'] || row['Nombre'] || row['NOMBRE'];
        const unidad = (row['unidad'] || row['Unidad'] || row['UNIDAD'] || '').toLowerCase() as Unidad;
        const stock = parseFloat(row['stock'] || row['Stock'] || row['stock_actual'] || '0');
        const fila = String(row['fila'] || row['Fila'] || row['FILA'] || '');
        const estanteria = String(row['estanteria'] || row['Estanteria'] || row['estantería'] || row['Estantería'] || '');
        const nivel = String(row['nivel'] || row['Nivel'] || row['NIVEL'] || '');

        if (!ref) { errors.push(`Fila ${num}: falta la referencia`); return; }
        if (!nombre) { errors.push(`Fila ${num}: falta el nombre`); return; }
        if (!fila || !estanteria || !nivel) { errors.push(`Fila ${num}: falta ubicación (fila/estanteria/nivel)`); return; }
        if (!UNIDADES_VALIDAS.includes(unidad)) {
          warnings.push(`Fila ${num}: unidad "${unidad}" no reconocida, se usará "ud"`);
        }

        productos.push({
          referencia: ref.trim(),
          nombre: nombre.trim(),
          categoria: row['categoria'] || row['Categoria'] || row['categoría'] || '',
          unidad: UNIDADES_VALIDAS.includes(unidad) ? unidad : 'ud',
          stock_actual: isNaN(stock) ? 0 : stock,
          stock_minimo: parseFloat(row['stock_minimo'] || row['stock mínimo'] || '0') || 0,
          fila: fila.trim(),
          estanteria: estanteria.trim(),
          nivel: nivel.trim(),
          proveedor: row['proveedor'] || row['Proveedor'] || '',
          precio_coste: parseFloat(row['precio_coste'] || row['precio coste'] || row['Precio'] || '0') || undefined,
        });
      });

      resolve({ data: productos, errors, warnings });
    };
    reader.readAsBinaryString(file);
  });
}

export function parseExcelPedidos(file: File): Promise<ImportResult<{ pedido: Partial<Pedido>; lineas: Partial<LineaPedido>[] }>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { raw: false });

      const errors: string[] = [];
      const warnings: string[] = [];
      const pedidosMap = new Map<string, { pedido: Partial<Pedido>; lineas: Partial<LineaPedido>[] }>();

      rows.forEach((row, i) => {
        const num = i + 2;
        const numPedido = String(row['numero_pedido'] || row['nº pedido'] || row['Nº Pedido'] || row['pedido'] || '').trim();
        const nombre = row['nombre'] || row['Nombre'] || '';
        const refProducto = row['referencia'] || row['ref_producto'] || row['Referencia'] || '';
        const cantidad = parseFloat(row['cantidad'] || row['Cantidad'] || '0');

        if (!numPedido) { errors.push(`Fila ${num}: falta número de pedido`); return; }
        if (!nombre) { errors.push(`Fila ${num}: falta nombre del cliente`); return; }

        if (!pedidosMap.has(numPedido)) {
          pedidosMap.set(numPedido, {
            pedido: {
              numero_pedido: numPedido,
              nombre: nombre.trim(),
              apellidos: (row['apellidos'] || row['Apellidos'] || '').trim(),
              dni: row['dni'] || row['DNI'] || '',
              empresa: row['empresa'] || row['Empresa'] || '',
              telefono: row['telefono'] || row['Teléfono'] || row['telefono'] || '',
              referencia_obra: row['obra'] || row['referencia_obra'] || row['Obra'] || '',
              fecha: row['fecha'] || row['Fecha'] || new Date().toISOString().split('T')[0],
              estado: 'pendiente',
            },
            lineas: [],
          });
        }

        if (refProducto && cantidad > 0) {
          const unidad = (row['unidad'] || 'ud').toLowerCase() as Unidad;
          pedidosMap.get(numPedido)!.lineas.push({
            producto_ref: refProducto.trim(),
            cantidad,
            unidad: UNIDADES_VALIDAS.includes(unidad) ? unidad : 'ud',
            recogido: false,
          });
        }
      });

      resolve({ data: Array.from(pedidosMap.values()), errors, warnings });
    };
    reader.readAsBinaryString(file);
  });
}
