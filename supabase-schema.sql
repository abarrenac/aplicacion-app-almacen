-- =====================================================
-- ALMACÉN PRO — Esquema de base de datos Supabase
-- Ejecuta este SQL en Supabase > SQL Editor > New query
-- =====================================================

-- Tabla de productos
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  referencia text unique not null,
  nombre text not null,
  categoria text default '',
  unidad text not null default 'ud',
  stock_actual numeric not null default 0,
  stock_minimo numeric not null default 0,
  fila text not null,
  estanteria text not null,
  nivel text not null,
  proveedor text default '',
  precio_coste numeric,
  qr_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabla de pedidos
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  numero_pedido text unique not null,
  nombre text not null,
  apellidos text default '',
  dni text default '',
  empresa text default '',
  telefono text default '',
  referencia_obra text default '',
  fecha date default current_date,
  estado text not null default 'pendiente',
  notas text default '',
  created_at timestamptz default now()
);

-- Líneas de pedido
create table if not exists lineas_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references pedidos(id) on delete cascade,
  producto_ref text not null,
  cantidad numeric not null,
  unidad text not null default 'ud',
  recogido boolean not null default false,
  created_at timestamptz default now()
);

-- Historial de movimientos de stock
create table if not exists movimientos_stock (
  id uuid primary key default gen_random_uuid(),
  producto_ref text not null,
  pedido_numero text,
  cantidad_cambio numeric not null,
  stock_anterior numeric not null,
  stock_nuevo numeric not null,
  motivo text default '',
  created_at timestamptz default now()
);

-- Índices para búsquedas rápidas
create index if not exists idx_productos_referencia on productos(referencia);
create index if not exists idx_productos_nombre on productos(nombre);
create index if not exists idx_pedidos_numero on pedidos(numero_pedido);
create index if not exists idx_pedidos_nombre on pedidos(nombre);
create index if not exists idx_pedidos_dni on pedidos(dni);
create index if not exists idx_pedidos_empresa on pedidos(empresa);
create index if not exists idx_lineas_pedido_id on lineas_pedido(pedido_id);
create index if not exists idx_lineas_producto_ref on lineas_pedido(producto_ref);
create index if not exists idx_movimientos_ref on movimientos_stock(producto_ref);

-- Row Level Security (desactivado para uso interno)
alter table productos disable row level security;
alter table pedidos disable row level security;
alter table lineas_pedido disable row level security;
alter table movimientos_stock disable row level security;

-- Datos de ejemplo para probar
insert into productos (referencia, nombre, categoria, unidad, stock_actual, stock_minimo, fila, estanteria, nivel, proveedor) values
('CEM-001', 'Cemento Portland 25kg', 'Cementos', 'saco', 120, 20, '1', 'A', '1', 'Lafarge'),
('TUB-050', 'Tubo PVC 50mm x 3m', 'Fontanería', 'pieza', 45, 10, '2', 'B', '2', 'Wavin'),
('GRI-001', 'Grifo monomando lavabo', 'Griferías', 'ud', 8, 3, '3', 'C', '1', 'Grohe'),
('PAV-200', 'Pavimento gres 60x60 Marengo', 'Pavimentos', 'caja', 34, 5, '4', 'A', '3', 'Porcelanosa'),
('PLT-80', 'Plato de ducha 80x80 blanco', 'Baño', 'ud', 3, 2, '5', 'D', '1', 'Roca')
on conflict (referencia) do nothing;
