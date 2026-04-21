import { UNIDAD_LABELS } from '@/lib/utils';
import { Unidad } from '@/types';

interface StockIndicatorProps {
  stock: number;
  stockMinimo: number;
  unidad: Unidad;
}

export default function StockIndicator({ stock, stockMinimo, unidad }: StockIndicatorProps) {
  const bajo = stock <= stockMinimo;
  const critico = stock === 0;
  const color = critico ? 'var(--red)' : bajo ? 'var(--amber)' : 'var(--green)';
  return (
    <span className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <span style={{ fontWeight: 600, color }}>
        {stock} {UNIDAD_LABELS[unidad]}
      </span>
      {bajo && !critico && (
        <span style={{ fontSize: 11, color: 'var(--amber)', background: 'rgba(245,158,11,0.1)', padding: '1px 6px', borderRadius: 4, border: '1px solid rgba(245,158,11,0.2)' }}>
          BAJO
        </span>
      )}
      {critico && (
        <span style={{ fontSize: 11, color: 'var(--red)', background: 'rgba(239,68,68,0.1)', padding: '1px 6px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.2)' }}>
          AGOTADO
        </span>
      )}
    </span>
  );
}
