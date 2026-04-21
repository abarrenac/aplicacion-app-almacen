'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import UbicacionBadge from '@/components/ui/UbicacionBadge';
import StockIndicator from '@/components/ui/StockIndicator';
import { supabase } from '@/lib/supabase';
import { Producto } from '@/types';
import { UNIDAD_LABELS } from '@/lib/utils';
import { Search, Package, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtrados, setFiltrados] = useState<Producto[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [catFiltro, setCatFiltro] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('productos')
      .select('*')
      .order('nombre');
    if (data) {
      setProductos(data);
      setFiltrados(data);
      const cats = [...new Set(data.map((p: Producto) => p.categoria).filter(Boolean))];
      setCategorias(cats);
    }
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    const q = query.toLowerCase();
    let res = productos;
    if (q) res = res.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.referencia.toLowerCase().includes(q) ||
      p.categoria?.toLowerCase().includes(q) ||
      p.proveedor?.toLowerCase().includes(q)
    );
    if (catFiltro) res = res.filter(p => p.categoria === catFiltro);
    setFiltrados(res);
  }, [query, catFiltro, productos]);

  const stockBajos = productos.filter(p => p.stock_actual <= p.stock_minimo && p.stock_minimo > 0).length;

  return (
    <AppLayout>
      <div className="p-4 md:p-6 fade-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 700, letterSpacing: '0.02em', margin: 0 }}>
              PRODUCTOS
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
              {productos.length} referencias · {stockBajos > 0 && (
                <span style={{ color: 'var(--amber)' }}>{stockBajos} con stock bajo</span>
              )}
            </p>
          </div>
          <Link href="/productos/nuevo" className="btn btn-primary">
            <Package size={15} /> Nuevo
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total referencias', value: productos.length, color: 'var(--text)' },
            { label: 'Stock bajo', value: stockBajos, color: 'var(--amber)' },
            { label: 'Sin stock', value: productos.filter(p => p.stock_actual === 0).length, color: 'var(--red)' },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center">
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: 'Barlow Condensed' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search & filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <input
              placeholder="Buscar por nombre, referencia, proveedor..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ paddingLeft: 34 }}
            />
          </div>
          {categorias.length > 0 && (
            <select value={catFiltro} onChange={e => setCatFiltro(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20" style={{ color: 'var(--muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="pulse-orange w-8 h-8 rounded-full mx-auto mb-3" style={{ background: 'var(--orange)' }} />
              <p style={{ fontSize: 13 }}>Cargando productos...</p>
            </div>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="card p-12 text-center" style={{ color: 'var(--muted)' }}>
            <Package size={40} className="mx-auto mb-3" style={{ opacity: 0.3 }} />
            <p style={{ fontSize: 15 }}>No se encontraron productos</p>
            {query && <p style={{ fontSize: 13, marginTop: 4 }}>Intenta con otro término de búsqueda</p>}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Referencia</th>
                    <th>Nombre</th>
                    <th className="hidden md:table-cell">Categoría</th>
                    <th>Stock</th>
                    <th>Ubicación</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(p => (
                    <tr key={p.id} style={{ cursor: 'pointer' }}
                      onClick={() => window.location.href = `/productos/${p.id}`}>
                      <td>
                        <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 13, color: 'var(--orange)' }}>
                          {p.referencia}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{p.nombre}</div>
                        <div className="md:hidden" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{p.categoria}</div>
                      </td>
                      <td className="hidden md:table-cell" style={{ color: 'var(--muted)', fontSize: 13 }}>{p.categoria}</td>
                      <td><StockIndicator stock={p.stock_actual} stockMinimo={p.stock_minimo} unidad={p.unidad} /></td>
                      <td><UbicacionBadge fila={p.fila} estanteria={p.estanteria} nivel={p.nivel} size="sm" /></td>
                      <td><ChevronRight size={16} style={{ color: 'var(--muted)' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
