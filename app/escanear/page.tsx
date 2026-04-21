'use client';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import UbicacionBadge from '@/components/ui/UbicacionBadge';
import StockIndicator from '@/components/ui/StockIndicator';
import { supabase } from '@/lib/supabase';
import { Producto } from '@/types';
import { QrCode, X, Search, Package } from 'lucide-react';
import Link from 'next/link';

export default function EscanearPage() {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [resultado, setResultado] = useState<Producto | null>(null);
  const [noEncontrado, setNoEncontrado] = useState('');
  const [busquedaManual, setBusquedaManual] = useState('');
  const [loading, setLoading] = useState(false);
  const scannerInstance = useRef<any>(null);

  const buscarProducto = async (ref: string) => {
    setLoading(true);
    setResultado(null);
    setNoEncontrado('');
    const { data } = await supabase
      .from('productos')
      .select('*')
      .or(`referencia.ilike.%${ref}%,nombre.ilike.%${ref}%`)
      .limit(1)
      .single();
    if (data) setResultado(data);
    else setNoEncontrado(ref);
    setLoading(false);
  };

  const iniciarScanner = async () => {
    if (typeof window === 'undefined') return;
    const { Html5Qrcode } = await import('html5-qrcode');
    setScannerActive(true);
    setTimeout(async () => {
      if (!scannerRef.current) return;
      const scanner = new Html5Qrcode('qr-reader');
      scannerInstance.current = scanner;
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decoded: string) => {
            scanner.stop().catch(() => {});
            setScannerActive(false);
            buscarProducto(decoded);
          },
          () => {}
        );
      } catch {
        setScannerActive(false);
      }
    }, 100);
  };

  const detenerScanner = () => {
    scannerInstance.current?.stop().catch(() => {});
    setScannerActive(false);
  };

  useEffect(() => () => { scannerInstance.current?.stop().catch(() => {}); }, []);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 fade-in max-w-lg">
        <h1 style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 700, letterSpacing: '0.02em', marginBottom: 6 }}>
          ESCANEAR
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
          Escanea el QR de un producto o búscalo manualmente.
        </p>

        {/* Camera scanner */}
        {!scannerActive ? (
          <button className="btn btn-primary w-full mb-4" style={{ height: 52, fontSize: 16, justifyContent: 'center' }}
            onClick={iniciarScanner}>
            <QrCode size={20} /> Abrir cámara y escanear
          </button>
        ) : (
          <div className="card overflow-hidden mb-4">
            <div style={{ position: 'relative' }}>
              <div id="qr-reader" ref={scannerRef} style={{ width: '100%' }} />
              <button onClick={detenerScanner}
                style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--panel2)', fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
              Apunta la cámara al código QR o de barras
            </div>
          </div>
        )}

        {/* Manual search */}
        <div className="relative mb-6">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
          <input
            placeholder="Buscar por referencia o nombre..."
            value={busquedaManual}
            onChange={e => setBusquedaManual(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && busquedaManual && buscarProducto(busquedaManual)}
            style={{ paddingLeft: 34, paddingRight: 80 }}
          />
          <button
            onClick={() => busquedaManual && buscarProducto(busquedaManual)}
            className="btn btn-primary"
            style={{ position: 'absolute', right: 4, top: 4, height: 32, padding: '0 12px', fontSize: 12 }}>
            Buscar
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="card p-8 text-center" style={{ color: 'var(--muted)' }}>
            <div className="pulse-orange w-6 h-6 rounded-full mx-auto mb-2" style={{ background: 'var(--orange)' }} />
            <p style={{ fontSize: 13 }}>Buscando...</p>
          </div>
        )}

        {/* No encontrado */}
        {!loading && noEncontrado && (
          <div className="card p-5">
            <div style={{ color: 'var(--amber)', fontWeight: 600, marginBottom: 8 }}>
              Producto no encontrado: <span style={{ fontFamily: 'Barlow Condensed' }}>{noEncontrado}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
              ¿Quieres crear este producto en el sistema?
            </p>
            <Link href={`/productos/nuevo?ref=${encodeURIComponent(noEncontrado)}`} className="btn btn-secondary">
              <Package size={14} /> Crear producto
            </Link>
          </div>
        )}

        {/* Resultado */}
        {!loading && resultado && (
          <div className="card fade-in">
            {/* Ubicación destacada */}
            <div style={{ background: 'var(--panel2)', borderBottom: '1px solid var(--border)', padding: '20px 20px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Barlow Condensed', fontWeight: 600, marginBottom: 10 }}>
                📍 Ubicación
              </div>
              <UbicacionBadge fila={resultado.fila} estanteria={resultado.estanteria} nivel={resultado.nivel} size="lg" />
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 13, color: 'var(--orange)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                {resultado.referencia}
              </div>
              <h2 style={{ fontFamily: 'Barlow Condensed', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>
                {resultado.nombre}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>{resultado.categoria}</p>

              <StockIndicator stock={resultado.stock_actual} stockMinimo={resultado.stock_minimo} unidad={resultado.unidad} />

              <div className="flex gap-2 mt-4">
                <Link href={`/productos/${resultado.id}`} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Ver ficha completa
                </Link>
                <button className="btn btn-ghost" onClick={() => { setResultado(null); setBusquedaManual(''); }}>
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
