'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/lib/supabase';
import { UNIDADES, UNIDAD_LABELS } from '@/lib/utils';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditarProductoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from('productos').select('*').eq('id', id).single()
      .then(({ data }) => { if (data) setForm(data); });
  }, [id]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const guardar = async () => {
    if (!form) return;
    setSaving(true);
    await supabase.from('productos').update({ ...form, updated_at: new Date().toISOString() }).eq('id', form.id);
    setSaving(false);
    router.push(`/productos/${id}`);
  };

  if (!form) return <AppLayout><div className="p-6" style={{ color: 'var(--muted)' }}>Cargando...</div></AppLayout>;

  const Label = ({ t, req }: { t: string; req?: boolean }) => (
    <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontFamily: 'Barlow Condensed', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
      {t} {req && <span style={{ color: 'var(--orange)' }}>*</span>}
    </label>
  );

  return (
    <AppLayout>
      <div className="p-4 md:p-6 fade-in max-w-xl">
        <Link href={`/productos/${id}`} className="btn btn-ghost mb-4" style={{ paddingLeft: 0 }}><ArrowLeft size={16} /> Volver</Link>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 26, fontWeight: 700, marginBottom: 24 }}>EDITAR PRODUCTO</h1>

        <div className="card p-5 mb-4">
          <div style={{ fontSize: 12, color: 'var(--orange)', fontFamily: 'Barlow Condensed', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 14, textTransform: 'uppercase' }}>Identificación</div>
          <div className="flex flex-col gap-4">
            <div><Label t="Referencia" req /><input value={form.referencia} onChange={e => set('referencia', e.target.value)} /></div>
            <div><Label t="Nombre" req /><input value={form.nombre} onChange={e => set('nombre', e.target.value)} /></div>
            <div><Label t="Categoría" /><input value={form.categoria || ''} onChange={e => set('categoria', e.target.value)} /></div>
          </div>
        </div>

        <div className="card p-5 mb-4">
          <div style={{ fontSize: 12, color: 'var(--orange)', fontFamily: 'Barlow Condensed', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 14, textTransform: 'uppercase' }}>Ubicación</div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label t="Fila" req /><input value={form.fila} onChange={e => set('fila', e.target.value)} /></div>
            <div><Label t="Estantería" req /><input value={form.estanteria} onChange={e => set('estanteria', e.target.value)} /></div>
            <div><Label t="Nivel" req /><input value={form.nivel} onChange={e => set('nivel', e.target.value)} /></div>
          </div>
        </div>

        <div className="card p-5 mb-4">
          <div style={{ fontSize: 12, color: 'var(--orange)', fontFamily: 'Barlow Condensed', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 14, textTransform: 'uppercase' }}>Stock</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label t="Unidad" />
              <select value={form.unidad} onChange={e => set('unidad', e.target.value)}>
                {UNIDADES.map(u => <option key={u} value={u}>{UNIDAD_LABELS[u]}</option>)}
              </select>
            </div>
            <div><Label t="Stock actual" /><input type="number" value={form.stock_actual} onChange={e => set('stock_actual', e.target.value)} /></div>
            <div><Label t="Stock mínimo" /><input type="number" value={form.stock_minimo} onChange={e => set('stock_minimo', e.target.value)} /></div>
          </div>
        </div>

        <div className="card p-5 mb-6">
          <div style={{ fontSize: 12, color: 'var(--orange)', fontFamily: 'Barlow Condensed', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 14, textTransform: 'uppercase' }}>Opcional</div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label t="Proveedor" /><input value={form.proveedor || ''} onChange={e => set('proveedor', e.target.value)} /></div>
            <div><Label t="Precio coste (€)" /><input type="number" value={form.precio_coste || ''} onChange={e => set('precio_coste', e.target.value)} /></div>
          </div>
        </div>

        <button className="btn btn-primary w-full" onClick={guardar} disabled={saving} style={{ height: 44, fontSize: 15, justifyContent: 'center' }}>
          <Save size={16} /> {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </AppLayout>
  );
}
