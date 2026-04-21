'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/lib/supabase';
import { UNIDADES, UNIDAD_LABELS } from '@/lib/utils';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NuevoProductoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    referencia: '', nombre: '', categoria: '', unidad: 'ud',
    stock_actual: '0', stock_minimo: '0',
    fila: '', estanteria: '', nivel: '',
    proveedor: '', precio_coste: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const guardar = async () => {
    if (!form.referencia || !form.nombre || !form.fila || !form.estanteria || !form.nivel) {
      alert('Rellena los campos obligatorios: referencia, nombre y ubicación.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('productos').insert({
      ...form,
      stock_actual: parseFloat(form.stock_actual) || 0,
      stock_minimo: parseFloat(form.stock_minimo) || 0,
      precio_coste: form.precio_coste ? parseFloat(form.precio_coste) : null,
    });
    setSaving(false);
    if (error) { alert('Error: ' + error.message); return; }
    router.push('/productos');
  };

  const Field = ({ label, k, required, type = 'text', placeholder = '' }: { label: string; k: string; required?: boolean; type?: string; placeholder?: string }) => (
    <div>
      <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontFamily: 'Barlow Condensed', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label} {required && <span style={{ color: 'var(--orange)' }}>*</span>}
      </label>
      <input type={type} placeholder={placeholder} value={(form as any)[k]} onChange={e => set(k, e.target.value)} />
    </div>
  );

  return (
    <AppLayout>
      <div className="p-4 md:p-6 fade-in max-w-xl">
        <Link href="/productos" className="btn btn-ghost mb-4" style={{ paddingLeft: 0 }}>
          <ArrowLeft size={16} /> Volver
        </Link>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 26, fontWeight: 700, marginBottom: 24 }}>
          NUEVO PRODUCTO
        </h1>

        <div className="card p-5 mb-4">
          <div style={{ fontSize: 12, color: 'var(--orange)', fontFamily: 'Barlow Condensed', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 14, textTransform: 'uppercase' }}>Identificación</div>
          <div className="flex flex-col gap-4">
            <Field label="Referencia" k="referencia" required placeholder="REF-001" />
            <Field label="Nombre del producto" k="nombre" required placeholder="Cemento Portland 25kg" />
            <Field label="Categoría" k="categoria" placeholder="Cementos y morteros" />
          </div>
        </div>

        <div className="card p-5 mb-4">
          <div style={{ fontSize: 12, color: 'var(--orange)', fontFamily: 'Barlow Condensed', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 14, textTransform: 'uppercase' }}>Ubicación en almacén</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontFamily: 'Barlow Condensed', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Fila <span style={{ color: 'var(--orange)' }}>*</span>
              </label>
              <input placeholder="3" value={form.fila} onChange={e => set('fila', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontFamily: 'Barlow Condensed', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Estantería <span style={{ color: 'var(--orange)' }}>*</span>
              </label>
              <input placeholder="B" value={form.estanteria} onChange={e => set('estanteria', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontFamily: 'Barlow Condensed', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Nivel <span style={{ color: 'var(--orange)' }}>*</span>
              </label>
              <input placeholder="2" value={form.nivel} onChange={e => set('nivel', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card p-5 mb-4">
          <div style={{ fontSize: 12, color: 'var(--orange)', fontFamily: 'Barlow Condensed', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 14, textTransform: 'uppercase' }}>Stock</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontFamily: 'Barlow Condensed', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Unidad</label>
              <select value={form.unidad} onChange={e => set('unidad', e.target.value)}>
                {UNIDADES.map(u => <option key={u} value={u}>{UNIDAD_LABELS[u]}</option>)}
              </select>
            </div>
            <Field label="Stock actual" k="stock_actual" type="number" placeholder="0" />
            <Field label="Stock mínimo" k="stock_minimo" type="number" placeholder="0" />
          </div>
        </div>

        <div className="card p-5 mb-6">
          <div style={{ fontSize: 12, color: 'var(--orange)', fontFamily: 'Barlow Condensed', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 14, textTransform: 'uppercase' }}>Opcional</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Proveedor" k="proveedor" placeholder="Nombre del proveedor" />
            <Field label="Precio coste (€)" k="precio_coste" type="number" placeholder="0.00" />
          </div>
        </div>

        <button className="btn btn-primary w-full" onClick={guardar} disabled={saving} style={{ height: 44, fontSize: 15, justifyContent: 'center' }}>
          <Save size={16} /> {saving ? 'Guardando...' : 'Guardar producto'}
        </button>
      </div>
    </AppLayout>
  );
}
