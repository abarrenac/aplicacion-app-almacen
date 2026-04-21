import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Almacén Pro — Gestión de Stock',
  description: 'Sistema interno de gestión de almacén',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
