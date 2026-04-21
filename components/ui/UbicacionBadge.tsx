interface UbicacionBadgeProps {
  fila: string;
  estanteria: string;
  nivel: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function UbicacionBadge({ fila, estanteria, nivel, size = 'md' }: UbicacionBadgeProps) {
  const sizes = {
    sm: { fontSize: 11, padding: '1px 6px' },
    md: { fontSize: 13, padding: '2px 8px' },
    lg: { fontSize: 16, padding: '4px 12px' },
  };
  const s = sizes[size];
  return (
    <span className="ubicacion" style={{ fontSize: s.fontSize }}>
      <span className="seg" style={{ padding: s.padding }}>F{fila}</span>
      <span className="seg" style={{ padding: s.padding }}>E{estanteria}</span>
      <span className="seg" style={{ padding: s.padding }}>N{nivel}</span>
    </span>
  );
}
