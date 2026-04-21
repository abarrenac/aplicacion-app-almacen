'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import UbicacionBadge from '@/components/ui/UbicacionBadge';
import { supabase } from '@/lib/supabase';
import { Pedido, LineaPedido, Producto, EstadoPedido } from '@/types';
import { ESTADO_LABELS, ESTADO_COLORS, UNIDAD_LABELS } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, Circle, Trash2, User, Building, Phone, Hash } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ESTADOS: EstadoPedido[] = ['pendiente', 'preparando', 'listo', 'entregado'];

export default function PedidoDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [lineas, setLineas] = useState<(LineaPedido & { producto?: Producto })[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    if (!id) return;
    const { data: ped } = await supabase.from('pedidos').select('*').eq('id', id).single();
    if (!ped) { setLoading(false); return; }
    setPedido(ped);

    const { data: lins } = await supabase
      .from('lineas_pedido')
      .select('*')
      .eq('pedido_id', id);

    if (lins && lins.length > 0) {
      const refs = lins.map((l: LineaPedido) => l.producto_ref);
      const { data: prods } = await supabase.from('productos').select('*').in('referencia', refs);
      const prodMap = new Map((prods || []).map((p: Producto) => [p.referencia, p]));
      setLineas(lins.map((l: LineaPedido) => ({ ...l, producto: prodMap.get(l.producto_ref) })));
    }
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [id]);

  const toggleRecogido = async (linea: LineaPedido & { producto?: Producto }) => {
    const nuevo = !linea.recogido;
    await supabase.from('lineas_pedido').update({ recogido: nuevo }).eq('id', linea.id);
    // Descuento/reposición de stock
    if (linea.producto) {
      const diff = nuevo ? -linea.cantidad : linea.cantidad;
      const nuevoStock = linea.producto.stock_actual + diff;
      await supabase.from('productos').update({ stock_actual: nuevoStock }).eq('referencia', linea.producto_ref);
      if (nuevo) {
        await supabase.from('movimientos_stock').insert({
          producto_ref: linea.producto_ref,
          pedido_numero: pedido?.numero_pedido,
          cantidad_cambio: -linea.cantidad,
          stock_anterior: linea.producto.stock_actual,
          stock_nuevo: nuevoStock,
          motivo: `Recogida pedido #${pedido?.numero_pedido}`,
        });
      }
    }
    cargar();
  };

  const cambiarEstado = async (estado: EstadoPedido) => {
    if (!pedido) return;
    await supabase.from('pedidos').update({ estado }).eq('id', pedido.id);
    setPedido({ ...pedido, estado });
  };

  const eliminar = async () => {
    if (!confirm('¿Eliminar este pedido?')) return;
    await supabase.from('lineas_pedido').delete().eq('pedido_id', id);
    await supabase.from('pedidos').delete().eq('id', id);
    router.push('/pedidos');
  };

  if (loading) return <AppLayout><div className="p-6" style={{ color: 'var(--muted)' }}>Cargando...</div></AppLayout>;
  if (!pedido) return <AppLayout><div className="p-6" style={{ color: 'var(--red)' }}>Pedido no encontrado</div></AppLayout>;

  const recogidas = lineas.filter(l => l.recogido).length;
  const total = lineas.length;

  return (
    <AppLayout>
      <div className="p-4 md:p-6 fade-in max-w-2xl">
        <Link href="/pedidos" className="btn btn-ghost mb-4" style={{ paddingLeft: 0 }}>
          <ArrowLeft size={16} /> Pedidos
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: 13, color: 'var(--orange)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
              Pedido #{pedido.numero_pedido}
            </div>
            <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 26, fontWeight: 700, margin: 0 }}>
              {pedido.nombre} {pedido.apellidos}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
              {pedido.fecha ? format(new Date(pedido.fecha), "d 'de' MMMM yyyy", { locale: es }) : ''}
            </p>
          </div>
          <button className="btn btn-danger" onClick={eliminar}><Trash2 size={14} /></button>
        </div>

        {/* Estado */}
        <div className="card p-4 mb-4">
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'Barlow Condensed', fontWeight: 600 }}>Estado del pedido</div>
          <div className="flex gap-2 flex-wrap">
            {ESTADOS.map(e => (
              <button key={e} onClick={() => cambiarEstado(e)}
                className="btn" style={{
                  padding: '5px 12px', fontSize: 12,
                  background: pedido.estado === e ? 'var(--orange)' : 'transparent',
                  color: pedido.estado === e ? '#000' : 'var(--muted)',
                  border: '1px solid',
                  borderColor: pedido.estado === e ? 'var(--orange)' : 'var(--border2)',
                  fontFamily: 'Barlow Condensed', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                {ESTADO_LABELS[e]}
              </button>
            ))}
          </div>
        </div>

        {/* Info cliente */}
        <div className="card p-4 mb-4">
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'Barlow Condensed', fontWeight: 600 }}>Datos del cliente</div>
          <div className="grid grid-cols-1 gap-2">
            {[
              { icon: User, label: `${pedido.nombre} ${pedido.apellidos}` },
              pedido.dni && { icon: Hash, label: `DNI: ${pedido.dni}` },
              pedido.empresa && { icon: Building, label: pedido.empresa },
              pedido.telefono && { icon: Phone, label: pedido.telefono },
              pedido.referencia_obra && { icon: Building, label: `Obra: ${pedido.referencia_obra}` },
            ].filter(Boolean).map((item: any, i) => (
              <div key={i} className="flex items-center gap-2" style={{ fontSize: 13 }}>
                <item.icon size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progreso */}
        {total > 0 && (
          <div className="card p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Barlow Condensed', fontWeight: 600 }}>
                Preparación
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: recogidas === total ? 'var(--green)' : 'var(--text)' }}>
                {recogidas}/{total} productos
              </span>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: recogidas === total ? 'var(--green)' : 'var(--orange)',
                width: `${total > 0 ? (recogidas / total) * 100 : 0}%`,
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        )}

        {/* Líneas */}
        <div className="card overflow-hidden mb-4">
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Barlow Condensed', fontWeight: 600 }}>
            Productos del pedido ({total})
          </div>
          {lineas.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'var(--muted)', fontSize: 13 }}>Sin líneas de producto</div>
          ) : (
            lineas.map(linea => (
              <div key={linea.id}
                className="flex items-center gap-3 p-4 border-b transition-all"
                style={{
                  borderColor: 'var(--border)',
                  opacity: linea.recogido ? 0.5 : 1,
                  background: linea.recogido ? 'rgba(34,197,94,0.03)' : 'transparent',
                }}>
                <button onClick={() => toggleRecogido(linea)} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {linea.recogido
                    ? <CheckCircle2 size={22} style={{ color: 'var(--green)' }} />
                    : <Circle size={22} style={{ color: 'var(--border2)' }} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 12, color: 'var(--orange)' }}>
                      {linea.producto_ref}
                    </span>
                    <span style={{ fontWeight: 500, fontSize: 14, textDecoration: linea.recogido ? 'line-through' : 'none' }}>
                      {linea.producto?.nombre || linea.producto_ref}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {linea.cantidad} {UNIDAD_LABELS[linea.unidad]}
                    </span>
                    {linea.producto && (
                      <UbicacionBadge fila={linea.producto.fila} estanteria={linea.producto.estanteria} nivel={linea.producto.nivel} size="sm" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
