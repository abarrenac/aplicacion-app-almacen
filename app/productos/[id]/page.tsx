'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import UbicacionBadge from '@/components/ui/UbicacionBadge';
import StockIndicator from '@/components/ui/StockIndicator';
import { supabase } from '@/lib/supabase';
import { Producto, Pedido } from '@/types';
import { UNIDAD_LABELS } from '@/lib/utils';
import { ArrowLeft, Printer, Edit, Trash2, Package } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import Link from 'next/link';

export default function ProductoDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [pedidosVinculados, setPedidosVinculados] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [editStock, setEditStock] = useState(false);
  const [nuevoStock, setNuevoStock] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: prod } = await supabase.from('productos').select('*').eq('id', id).single();
      if (prod) {
        setProducto(prod);
        setNuevoStock(String(prod.stock_actual));
        // Pedidos activos que incluyen este producto
        const { data: lineas } = await supabase
          .from('lineas_pedido')
          .select('pedido_id, pedidos(numero_pedido, nombre, apellidos, estado)')
          .eq('producto_ref', prod.referencia)
          .eq('recogido', false);
        if (lineas) {
          const pedidos = lineas
            .map((l: any) => l.pedidos)
            .filter((p: any) => p && p.estado !== 'entregado');
          setPedidosVinculados(pedidos);
        }
      }
      setLoading(false);
    })();
  }, [id]);

  const actualizarStock = async () => {
    if (!producto) return;
    const nuevo = parseFloat(nuevoStock);
    if (isNaN(nuevo)) return;
    await supabase.from('productos').update({ stock_actual: nuevo }).eq('id', producto.id);
    await supabase.from('movimientos_stock').insert({
      producto_ref: producto.referencia,
      cantidad_cambio: nuevo - producto.stock_actual,
      stock_anterior: producto.stock_actual,
      stock_nuevo: nuevo,
      motivo: 'Ajuste manual',
    });
    setProducto({ ...producto, stock_actual: nuevo });
    setEditStock(false);
  };

  const imprimirQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL();
    const win = window.open('');
    if (!win) return;
    win.document.write(`
      <html><head><title>QR - ${producto?.referencia}</title>
      <style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#fff;}
      img{width:200px;height:200px;} p{margin:8px 0 2px;font-size:14px;font-weight:700;} small{font-size:11px;color:#666;}</style>
      </head><body>
      <img src="${url}"/>
      <p>${producto?.referencia}</p>
      <small>${producto?.nombre}</small>
      <script>window.onload=()=>{window.print();window.close();}</script>
      </body></html>
    `);
  };

  const eliminar = async () => {
    if (!producto || !confirm('¿Eliminar este producto?')) return;
    await supabase.from('productos').delete().eq('id', producto.id);
    router.push('/productos');
  };

  if (loading) return <AppLayout><div className="p-6" style={{ color: 'var(--muted)' }}>Cargando...</div></AppLayout>;
  if (!producto) return <AppLayout><div className="p-6" style={{ color: 'var(--red)' }}>Producto no encontrado</div></AppLayout>;

  return (
    <AppLayout>
      <div className="p-4 md:p-6 fade-in max-w-2xl">
        {/* Back */}
        <Link href="/productos" className="btn btn-ghost mb-4" style={{ paddingLeft: 0 }}>
          <ArrowLeft size={16} /> Productos
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: 13, color: 'var(--orange)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
              {producto.referencia}
            </div>
            <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 26, fontWeight: 700, margin: 0 }}>
              {producto.nombre}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{producto.categoria}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/productos/${id}/editar`} className="btn btn-secondary"><Edit size={14} /></Link>
            <button className="btn btn-danger" onClick={eliminar}><Trash2 size={14} /></button>
          </div>
        </div>

        {/* Ubicación grande */}
        <div className="card p-5 mb-4">
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'Barlow Condensed', fontWeight: 600 }}>
            Ubicación en almacén
          </div>
          <UbicacionBadge fila={producto.fila} estanteria={producto.estanteria} nivel={producto.nivel} size="lg" />
        </div>

        {/* Stock */}
        <div className="card p-5 mb-4">
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'Barlow Condensed', fontWeight: 600 }}>
            Stock actual
          </div>
          {editStock ? (
            <div className="flex gap-2 items-center">
              <input type="number" value={nuevoStock} onChange={e => setNuevoStock(e.target.value)}
                style={{ width: 120 }} autoFocus />
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>{UNIDAD_LABELS[producto.unidad]}</span>
              <button className="btn btn-primary" onClick={actualizarStock}>Guardar</button>
              <button className="btn btn-ghost" onClick={() => setEditStock(false)}>Cancelar</button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <StockIndicator stock={producto.stock_actual} stockMinimo={producto.stock_minimo} unidad={producto.unidad} />
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditStock(true)}>
                <Edit size={12} /> Ajustar
              </button>
            </div>
          )}
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
            Stock mínimo: {producto.stock_minimo} {UNIDAD_LABELS[producto.unidad]}
          </div>
        </div>

        {/* Info grid */}
        <div className="card p-5 mb-4">
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'Barlow Condensed', fontWeight: 600 }}>
            Información
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Unidad', value: UNIDAD_LABELS[producto.unidad] },
              { label: 'Proveedor', value: producto.proveedor || '—' },
              { label: 'Precio coste', value: producto.precio_coste ? `${producto.precio_coste} €` : '—' },
              { label: 'Referencia', value: producto.referencia },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pedidos vinculados */}
        {pedidosVinculados.length > 0 && (
          <div className="card p-5 mb-4">
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'Barlow Condensed', fontWeight: 600 }}>
              En pedidos activos ({pedidosVinculados.length})
            </div>
            <div className="flex flex-col gap-2">
              {pedidosVinculados.map((p: any, i) => (
                <Link key={i} href={`/pedidos?q=${p.numero_pedido}`}
                  className="flex items-center justify-between p-3 rounded-md"
                  style={{ background: 'var(--panel2)', border: '1px solid var(--border2)' }}>
                  <div>
                    <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 13, color: 'var(--orange)' }}>#{p.numero_pedido}</div>
                    <div style={{ fontSize: 13 }}>{p.nombre} {p.apellidos}</div>
                  </div>
                  <span className="badge" style={{ color: 'var(--amber)', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)' }}>
                    {p.estado}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* QR Code */}
        <div className="card p-5">
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'Barlow Condensed', fontWeight: 600 }}>
            Código QR
          </div>
          <div className="flex items-center gap-6">
            <div ref={qrRef} style={{ background: '#fff', padding: 12, borderRadius: 8, display: 'inline-block' }}>
              <QRCodeCanvas value={producto.referencia} size={120} />
            </div>
            <div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>
                Imprime este QR y pégalo en el producto o estantería para escanearlo con la cámara.
              </p>
              <button className="btn btn-secondary" onClick={imprimirQR}>
                <Printer size={14} /> Imprimir etiqueta
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
