'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/lib/supabase';
import { UNIDADES, UNIDAD_LABELS } from '@/lib/utils';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface LineaForm { ref: string; cantidad: string; unidad: string; }

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    numero_pedido: '', nombre: '', apellidos: '', dni: '',
    empresa: '', telefono: '', referencia_obra: '', fecha: new Date().toISOString().split('T')[0],
  });
  const [lineas, setLineas] = useState<LineaForm[]>([{ ref: '', cantidad: '', unidad: 'ud' }]);

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const setL = (i: number, k: string, v: string) => setLineas(ls => ls.map((l, idx) => idx === i ? { ...l, [k]: v } : l));
  const addLinea = () => setLineas(ls => [...ls, { ref: '', cantidad: '', unidad: 'ud' }]);
  const removeLinea = (i: number) => setLineas(ls => ls.filter((_, idx) => idx !== i));

  const guardar = async () => {
    if (!form.numero_pedido || !form.nombre) { alert('Número de pedido y nombre son obligatorios.'); return; }
    setSaving(true);
    const { data: ped, error } = await supabase.from('pedidos').insert({ ...form, estado: 'pendiente' }).select().single();
    if (error || !ped) { alert('Error: ' + error?.message); setSaving(false); return; }

    const lineasValidas = lineas.filter(l => l.ref && l.cantidad);
    if (lineasValidas.length > 0) {
      await supabase.from('lineas_pedido').insert(lineasValidas.map(l => ({
        pedido_id: ped.id,
        producto_ref: l.ref.trim(),
        cantidad: parseFloat(l.cantidad),
        unidad: l.unidad,
        recogido: false,
      })));
    }
    setSaving(false);
    router.push(`/pedidos/${ped.id}`);
  };

  const Label = ({ t, req }: { t: string; req?: boolean }) => (
    <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontFamily: 'Barlow Condensed', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
      {t} {req && <span style={{ color: 'var(--orange)' }}>*</span>}
    </label>
  );

  return (
    <AppLayout>
      <div className="p-4 md:p-6 fade-in max-w-xl">
        <Link href="/pedidos" className="btn btn-ghost mb-4" style={{ paddingLeft: 0 }}><ArrowLeft size={16} /> Volver</Link>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 26, fontWeight: 700, marginBottom: 24 }}>NUEVO PEDIDO</h1>

        <div className="card p-5 mb-4">
          <div style={{ fontSize: 12, color: 'var(--orange)', fontFamily: 'Barlow Condensed', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 14, textTransform: 'uppercase' }}>Identificación</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 md:col-span-1">
              <Label t="Nº Pedido" req />
              <input placeholder="PED-001" value={form.numero_pedido} onChange={e => setF('numero_pedido', e.target.value)} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <Label t="Fecha" />
              <input type="date" value={form.fecha} onChange={e => setF('fecha', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card p-5 mb-4">
          <div style={{ fontSize: 12, color: 'var(--orange)', fontFamily: 'Barlow Condensed', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 14, textTransform: 'uppercase' }}>Cliente</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { k: 'nombre', t: 'Nombre', req: true, col: 1 },
              { k: 'apellidos', t: 'Apellidos', req: true, col: 1 },
              { k: 'dni', t: 'DNI', col: 1 },
              { k: 'telefono', t: 'Teléfono', col: 1 },
              { k: 'empresa', t: 'Empresa', col: 2 },
              { k: 'referencia_obra', t: 'Ref. Obra', col: 2 },
            ].map(({ k, t, req, col }) => (
              <div key={k} className={col === 2 ? 'col-span-2' : ''}>
                <Label t={t} req={req} />
                <input value={(form as any)[k]} onChange={e => setF(k, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div style={{ fontSize: 12, color: 'var(--orange)', fontFamily: 'Barlow Condensed', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Productos</div>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={addLinea}><Plus size={13} /> Añadir línea</button>
          </div>
          <div className="flex flex-col gap-2">
            {lineas.map((l, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input placeholder="Referencia" value={l.ref} onChange={e => setL(i, 'ref', e.target.value)} style={{ flex: 2 }} />
                <input type="number" placeholder="Cant." value={l.cantidad} onChange={e => setL(i, 'cantidad', e.target.value)} style={{ flex: 1 }} />
                <select value={l.unidad} onChange={e => setL(i, 'unidad', e.target.value)} style={{ flex: 1 }}>
                  {UNIDADES.map(u => <option key={u} value={u}>{UNIDAD_LABELS[u]}</option>)}
                </select>
                {lineas.length > 1 && (
                  <button onClick={() => removeLinea(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary w-full" onClick={guardar} disabled={saving} style={{ height: 44, fontSize: 15, justifyContent: 'center' }}>
          <Save size={16} /> {saving ? 'Guardando...' : 'Crear pedido'}
        </button>
      </div>
    </AppLayout>
  );
}
