'use client';
import { useState, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/lib/supabase';
import { parseExcelProductos, parseExcelPedidos } from '@/lib/excel';
import { Upload, CheckCircle2, AlertTriangle, XCircle, Database, FileSpreadsheet, Package, Users, QrCode, TrendingDown } from 'lucide-react';
import Link from 'next/link';

type Tab = 'importar' | 'stock' | 'historial';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('importar');
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');

  const login = () => {
    if (password === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'almacen2024')) {
      setAuthed(true);
    } else {
      setAuthError('Contraseña incorrecta');
    }
  };

  if (!authed) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
          <div className="card p-8" style={{ maxWidth: 360, width: '100%' }}>
            <div className="flex items-center gap-3 mb-6">
              <Database size={24} style={{ color: 'var(--orange)' }} />
              <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 22, fontWeight: 700, margin: 0 }}>PANEL ADMIN</h1>
            </div>
            <div className="mb-4">
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontFamily: 'Barlow Condensed', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Contraseña
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()} placeholder="••••••••" autoFocus />
            </div>
            {authError && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{authError}</p>}
            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={login}>
              Acceder
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 700, letterSpacing: '0.02em', margin: 0 }}>ADMINISTRACIÓN</h1>
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setAuthed(false)}>Cerrar sesión</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ background: 'var(--panel)', border: '1px solid var(--border)', display: 'inline-flex' }}>
          {([
            { id: 'importar', icon: FileSpreadsheet, label: 'Importar Excel' },
            { id: 'stock', icon: TrendingDown, label: 'Stock bajo' },
            { id: 'historial', icon: Database, label: 'Historial' },
          ] as { id: Tab; icon: any; label: string }[]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="btn" style={{
                padding: '6px 14px', fontSize: 13,
                background: tab === t.id ? 'var(--orange)' : 'transparent',
                color: tab === t.id ? '#000' : 'var(--muted)',
                border: 'none', gap: 6,
                fontFamily: 'Barlow Condensed', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'importar' && <ImportarTab />}
        {tab === 'stock' && <StockBajoTab />}
        {tab === 'historial' && <HistorialTab />}
      </div>
    </AppLayout>
  );
}

function ImportarTab() {
  const [resultP, setResultP] = useState<any>(null);
  const [resultO, setResultO] = useState<any>(null);
  const [loadingP, setLoadingP] = useState(false);
  const [loadingO, setLoadingO] = useState(false);
  const fileP = useRef<HTMLInputElement>(null);
  const fileO = useRef<HTMLInputElement>(null);

  const importarProductos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setLoadingP(true);
    const result = await parseExcelProductos(file);
    let insertados = 0, actualizados = 0;
    for (const p of result.data) {
      const { data: exist } = await supabase.from('productos').select('id').eq('referencia', p.referencia).single();
      if (exist) {
        await supabase.from('productos').update({ ...p, updated_at: new Date().toISOString() }).eq('referencia', p.referencia);
        actualizados++;
      } else {
        await supabase.from('productos').insert(p);
        insertados++;
      }
    }
    setResultP({ ...result, insertados, actualizados });
    setLoadingP(false);
    e.target.value = '';
  };

  const importarPedidos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setLoadingO(true);
    const result = await parseExcelPedidos(file);
    let insertados = 0;
    for (const { pedido, lineas } of result.data) {
      const { data: ped } = await supabase.from('pedidos').insert(pedido).select().single();
      if (ped && lineas.length > 0) {
        await supabase.from('lineas_pedido').insert(lineas.map(l => ({ ...l, pedido_id: ped.id })));
      }
      insertados++;
    }
    setResultO({ ...result, insertados });
    setLoadingO(false);
    e.target.value = '';
  };

  const DropZone = ({ label, icon: Icon, onFile, loading, result, inputRef, accept }: any) => (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon size={20} style={{ color: 'var(--orange)' }} />
        <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 16, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <input type="file" ref={inputRef} accept={accept} onChange={onFile} style={{ display: 'none' }} />
      <button className="btn btn-secondary w-full" style={{ justifyContent: 'center', height: 44 }}
        onClick={() => inputRef.current?.click()} disabled={loading}>
        <Upload size={15} /> {loading ? 'Importando...' : 'Seleccionar archivo Excel (.xlsx)'}
      </button>
      {result && (
        <div className="mt-4 flex flex-col gap-2">
          {result.insertados > 0 && (
            <div className="flex items-center gap-2" style={{ fontSize: 13, color: 'var(--green)' }}>
              <CheckCircle2 size={14} /> {result.insertados} registros nuevos importados
            </div>
          )}
          {result.actualizados > 0 && (
            <div className="flex items-center gap-2" style={{ fontSize: 13, color: 'var(--blue)' }}>
              <CheckCircle2 size={14} /> {result.actualizados} registros actualizados
            </div>
          )}
          {result.warnings?.map((w: string, i: number) => (
            <div key={i} className="flex items-start gap-2" style={{ fontSize: 12, color: 'var(--amber)' }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 2 }} /> {w}
            </div>
          ))}
          {result.errors?.map((e: string, i: number) => (
            <div key={i} className="flex items-start gap-2" style={{ fontSize: 12, color: 'var(--red)' }}>
              <XCircle size={13} style={{ flexShrink: 0, marginTop: 2 }} /> {e}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <div className="card p-4" style={{ background: 'rgba(249,115,22,0.06)', borderColor: 'rgba(249,115,22,0.2)' }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
          Sube un Excel con los datos. Las columnas se detectan automáticamente.
          Los productos existentes (misma referencia) se actualizarán.
          Descarga las <strong style={{ color: 'var(--text)' }}>plantillas de ejemplo</strong> más abajo.
        </p>
      </div>
      <DropZone label="Importar Productos" icon={Package} onFile={importarProductos} loading={loadingP} result={resultP} inputRef={fileP} accept=".xlsx,.xls,.csv" />
      <DropZone label="Importar Pedidos" icon={Users} onFile={importarPedidos} loading={loadingO} result={resultO} inputRef={fileO} accept=".xlsx,.xls,.csv" />
    </div>
  );
}

function StockBajoTab() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const cargar = async () => {
    const { data } = await supabase.from('productos').select('*').filter('stock_actual', 'lte', supabase.rpc as any);
    // Simple query: stock_actual <= stock_minimo
    const { data: all } = await supabase.from('productos').select('*').gt('stock_minimo', 0);
    if (all) setProductos(all.filter((p: any) => p.stock_actual <= p.stock_minimo));
    setLoaded(true);
  };

  if (!loaded) return (
    <div>
      <button className="btn btn-primary mb-4" onClick={cargar}><TrendingDown size={14} /> Ver stock bajo</button>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{productos.length} productos con stock bajo o agotado</span>
        <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={cargar}>Actualizar</button>
      </div>
      {productos.length === 0 ? (
        <div className="card p-8 text-center" style={{ color: 'var(--green)' }}>
          <CheckCircle2 size={36} className="mx-auto mb-3" />
          <p>Todo el stock está por encima del mínimo</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="tabla">
            <thead><tr><th>Referencia</th><th>Nombre</th><th>Stock</th><th>Mínimo</th><th></th></tr></thead>
            <tbody>
              {productos.map((p: any) => (
                <tr key={p.id}>
                  <td><span style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, color: 'var(--orange)', fontSize: 13 }}>{p.referencia}</span></td>
                  <td style={{ fontSize: 13 }}>{p.nombre}</td>
                  <td><span style={{ fontWeight: 600, color: p.stock_actual === 0 ? 'var(--red)' : 'var(--amber)' }}>{p.stock_actual}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--muted)' }}>{p.stock_minimo}</td>
                  <td><Link href={`/productos/${p.id}`} style={{ fontSize: 12, color: 'var(--orange)', textDecoration: 'none' }}>Ver →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function HistorialTab() {
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const cargar = async () => {
    const { data } = await supabase.from('movimientos_stock').select('*').order('created_at', { ascending: false }).limit(100);
    if (data) setMovimientos(data);
    setLoaded(true);
  };

  if (!loaded) return (
    <div><button className="btn btn-primary mb-4" onClick={cargar}><Database size={14} /> Cargar historial</button></div>
  );

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between mb-4">
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>Últimos {movimientos.length} movimientos</span>
        <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={cargar}>Actualizar</button>
      </div>
      <div className="card overflow-hidden">
        <table className="tabla">
          <thead><tr><th>Fecha</th><th>Referencia</th><th>Cambio</th><th>Motivo</th></tr></thead>
          <tbody>
            {movimientos.map((m: any) => (
              <tr key={m.id}>
                <td style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {new Date(m.created_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td><span style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, color: 'var(--orange)', fontSize: 13 }}>{m.producto_ref}</span></td>
                <td>
                  <span style={{ fontWeight: 600, color: m.cantidad_cambio > 0 ? 'var(--green)' : 'var(--red)', fontSize: 13 }}>
                    {m.cantidad_cambio > 0 ? '+' : ''}{m.cantidad_cambio}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--muted)' }}>{m.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
