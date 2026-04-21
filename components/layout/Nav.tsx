'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Users, QrCode, MessageSquare, Settings, Warehouse } from 'lucide-react';

const NAV = [
  { href: '/productos', icon: Package, label: 'Productos' },
  { href: '/pedidos', icon: Users, label: 'Pedidos' },
  { href: '/escanear', icon: QrCode, label: 'Escanear' },
  { href: '/asistente', icon: MessageSquare, label: 'Diseño IA' },
  { href: '/admin', icon: Settings, label: 'Admin' },
];

export default function Nav() {
  const path = usePathname();
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen border-r fixed left-0 top-0 z-50"
        style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Warehouse size={20} style={{ color: 'var(--orange)' }} />
            <span style={{ fontFamily: 'Barlow Condensed', fontSize: 18, fontWeight: 700, letterSpacing: '0.04em' }}>
              ALMACÉN PRO
            </span>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = path.startsWith(href);
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all"
                style={{
                  background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
                  color: active ? 'var(--orange)' : 'var(--muted)',
                  borderLeft: active ? '2px solid var(--orange)' : '2px solid transparent',
                  fontWeight: active ? 600 : 400,
                }}>
                <Icon size={17} />
                <span style={{ fontSize: 14 }}>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)', fontSize: 11, color: 'var(--muted)' }}>
          Almacén Pro v1.0
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t flex"
        style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path.startsWith(href);
          return (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all"
              style={{ color: active ? 'var(--orange)' : 'var(--muted)' }}>
              <Icon size={20} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, fontFamily: 'Barlow Condensed', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
