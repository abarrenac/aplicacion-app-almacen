'use client';
import { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Send, ImagePlus, X, Bot, User, Loader2 } from 'lucide-react';

interface Mensaje {
  role: 'user' | 'assistant';
  content: string;
  imagen?: string;
}

export default function AsistentePage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de diseño especializado en materiales de construcción.\n\nPuedo ayudarte a visualizar cómo quedaría cualquier producto de tu catálogo en un espacio. Para empezar, dime:\n\n• La **referencia del producto** que quieres ver\n• Una **foto o descripción** del espacio (habitación, terraza, baño, fachada...)\n• Las **medidas aproximadas** si las tienes\n\n¿Por dónde empezamos?'
    }
  ]);
  const [input, setInput] = useState('');
  const [imagen, setImagen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, loading]);

  const adjuntarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagen(reader.result as string);
    reader.readAsDataURL(file);
  };

  const enviar = async () => {
    if (!input.trim() && !imagen) return;
    const nuevoMensaje: Mensaje = { role: 'user', content: input, imagen: imagen || undefined };
    const historial = [...mensajes, nuevoMensaje];
    setMensajes(historial);
    setInput('');
    setImagen(null);
    setLoading(true);

    try {
      const res = await fetch('/api/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajes: historial }),
      });
      const data = await res.json();
      setMensajes(prev => [...prev, { role: 'assistant', content: data.respuesta || 'Error al procesar la respuesta.' }]);
    } catch {
      setMensajes(prev => [...prev, { role: 'assistant', content: 'Error de conexión. Comprueba tu clave de API en .env.local.' }]);
    }
    setLoading(false);
  };

  const renderTexto = (texto: string) => {
    return texto.split('\n').map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/•/g, '·');
      return <p key={i} style={{ margin: '3px 0', fontSize: 14, lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }} />;
    });
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--panel)', flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} style={{ color: 'var(--orange)' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 16, fontWeight: 700, letterSpacing: '0.04em' }}>ASISTENTE DE DISEÑO</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Arquitectura e interiorismo · IA especializada en construcción</div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mensajes.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Bot size={16} style={{ color: 'var(--orange)' }} />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%',
                  background: m.role === 'user' ? 'var(--orange)' : 'var(--panel)',
                  border: `1px solid ${m.role === 'user' ? 'var(--orange)' : 'var(--border)'}`,
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  padding: '12px 16px',
                  color: m.role === 'user' ? '#000' : 'var(--text)',
                }}>
                  {m.imagen && (
                    <img src={m.imagen} alt="adjunto" style={{ width: '100%', maxWidth: 260, borderRadius: 6, marginBottom: 10, display: 'block' }} />
                  )}
                  {renderTexto(m.content)}
                </div>
                {m.role === 'user' && (
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--panel2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <User size={16} style={{ color: 'var(--muted)' }} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={16} style={{ color: 'var(--orange)' }} />
                </div>
                <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px 12px 12px 2px', padding: '14px 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Loader2 size={14} style={{ color: 'var(--orange)', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>Analizando...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input area */}
        <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--border)', background: 'var(--panel)', flexShrink: 0 }}>
          {imagen && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center', maxWidth: 640, margin: '0 auto 10px' }}>
              <img src={imagen} alt="preview" style={{ height: 52, width: 52, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--muted)', flex: 1 }}>Imagen adjunta</span>
              <button onClick={() => setImagen(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
                <X size={16} />
              </button>
            </div>
          )}
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <input type="file" ref={fileRef} accept="image/*" onChange={adjuntarImagen} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current?.click()}
              className="btn btn-ghost" style={{ padding: 8, flexShrink: 0, height: 40 }}>
              <ImagePlus size={18} />
            </button>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }}
              placeholder="Escribe la referencia del producto y describe el espacio... (Enter para enviar)"
              style={{ flex: 1, minHeight: 40, maxHeight: 120, resize: 'none', lineHeight: 1.5, paddingTop: 10, paddingBottom: 10 }}
              rows={1}
            />
            <button onClick={enviar} disabled={loading || (!input.trim() && !imagen)}
              className="btn btn-primary" style={{ padding: 10, flexShrink: 0, height: 40, width: 40, justifyContent: 'center' }}>
              <Send size={16} />
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 8, maxWidth: 640, margin: '8px auto 0' }}>
            Puedes adjuntar fotos del espacio, bocetos o planos · Shift+Enter para salto de línea
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
}
