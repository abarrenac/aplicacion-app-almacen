'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/lib/supabase';
import { Pedido, EstadoPedido } from '@/types';
import { ESTADO_LABELS, ESTADO_COLORS } from '@/lib/utils';
import { Search, Users, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ESTADOS: EstadoPedido[] = ['pendiente', 'preparando', 'listo', 'entregado'];

function PedidosContent() {
  const searchParams = useSearchParams();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtrados, setFiltrados] = useState<Pedido[]>([]);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | ''>('');
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pedidos')
      .select('*')
      .order('fecha', { ascending: false });
    if (data) { setPedidos(data); setFiltrados(data); }
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    const q = query.toLowerCase();
    let res = pedidos;
    if (q) res = res.filter(p =>
      p.numero_pedido.toLowerCase().includes(q) ||
      p.nombre.toLowerCase().includes(q) ||
      p.apellidos.toLowerCase().includes(q) ||
      (p.dni || '').toLowerCase().includes(q) ||
      (p.empresa || '').toLowerCase().includes(q) ||
      (p.referencia_obra || '').toLowerCase().includes(q)
    );
    if (estadoFiltro) res = res.filter(p => p.estado === estadoFiltro);
    setFiltrados(res);
  }, [query, estadoFiltro, pedidos]);

  return (
    <div className="p-4 md:p-6 fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 700, letterSpacing: '0.02em', margin: 0 }}>PEDIDOS</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{pedidos.length} pedidos registrados</p>
        </div>
        <Link href="/pedidos/nuevo" className="btn btn-primary"><Plus size={15} /> Nuevo</Link>
      </div>

      {/* Estado tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['', ...ESTADOS] as (EstadoPedido | '')[]).map(e => (
          <button key={e} onClick={() => setEstadoFiltro(e)}
            className="btn" style={{
              padding: '5px 12px', fontSize: 12,
              background: estadoFiltro === e ? 'var(--orange)' : 'transparent',
              color: estadoFiltro === e ? '#000' : 'var(--muted)',
              border: '1px solid',
              borderColor: estadoFiltro === e ? 'var(--orange)' : 'var(--border2)',
              fontFamily: 'Barlow Condensed', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
            {e === '' ? 'Todos' : ESTADO_LABELS[e]}
            <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.8 }}>
              ({e === '' ? pedidos.length : pedidos.filter(p => p.estado === e).length})
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
        <input placeholder="Buscar por nombre, DNI, empresa, obra, nº pedido..."
          value={query} onChange={e => setQuery(e.target.value)} style={{ paddingLeft: 34 }} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: 'var(--muted)' }}>
          <p>Cargando pedidos...</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card p-12 text-center" style={{ color: 'var(--muted)' }}>
          <Users size={40} className="mx-auto mb-3" style={{ opacity: 0.3 }} />
          <p>No se encontraron pedidos</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nº Pedido</th>
                  <th>Cliente</th>
                  <th className="hidden md:table-cell">Empresa / Obra</th>
                  <th className="hidden md:table-cell">Fecha</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(p => (
                  <tr key={p.id} style={{ cursor: 'pointer' }}
                    onClick={() => window.location.href = `/pedidos/${p.id}`}>
                    <td>
                      <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--orange)' }}>
                        #{p.numero_pedido}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.nombre} {p.apellidos}</div>
                      {p.dni && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.dni}</div>}
                    </td>
                    <td className="hidden md:table-cell" style={{ color: 'var(--muted)', fontSize: 13 }}>
                      {p.empresa || p.referencia_obra || '—'}
                    </td>
                    <td className="hidden md:table-cell" style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {p.fecha ? format(new Date(p.fecha), 'dd MMM yyyy', { locale: es }) : '—'}
                    </td>
                    <td>
                      <span className={`badge ${ESTADO_COLORS[p.estado]}`}>
                        {ESTADO_LABELS[p.estado]}
                      </span>
                    </td>
                    <td><ChevronRight size={16} style={{ color: 'var(--muted)' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PedidosPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-6" style={{ color: 'var(--muted)' }}>Cargando...</div>}>
        <PedidosContent />
      </Suspense>
    </AppLayout>
  );
}
