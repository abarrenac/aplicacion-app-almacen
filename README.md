# 🏗️ Almacén Pro

Sistema interno de gestión de almacén para empresa de materiales de construcción.

## ✅ Características

- **📦 Gestión de productos** — Fichas completas con ubicación (Fila · Estantería · Nivel), stock en múltiples unidades y código QR imprimible
- **👤 Gestión de pedidos** — Búsqueda por nombre, DNI, empresa, obra o número de pedido
- **📷 Escáner QR** — Cámara del móvil para localizar productos al instante
- **🤖 Asistente de diseño IA** — Chat con Claude para visualizar productos en espacios reales
- **⚙️ Panel admin** — Importación desde Excel, alertas de stock bajo e historial

---

## 🚀 Instalación paso a paso

### 1. Clona el repositorio

```bash
git clone https://github.com/TU_USUARIO/almacen-app.git
cd almacen-app
npm install
```

### 2. Crea el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → **New project**
2. Elige nombre y contraseña de base de datos
3. Una vez creado, ve a **SQL Editor** → **New query**
4. Copia y pega todo el contenido de `supabase-schema.sql` y pulsa **Run**
5. Ve a **Settings → API** y copia:
   - `Project URL`
   - `anon public key`

### 3. Configura las variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyXXXXXX
ANTHROPIC_API_KEY=sk-ant-XXXXXXX
NEXT_PUBLIC_ADMIN_PASSWORD=tu_contraseña_segura
```

- **Supabase URL y Key**: en tu proyecto Supabase → Settings → API
- **Anthropic API Key**: en [console.anthropic.com](https://console.anthropic.com) → API Keys
- **Admin password**: la contraseña que quieras para acceder al panel de administración

### 4. Ejecuta en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📤 Despliegue en Vercel (gratis)

1. Sube el código a GitHub: [github.com/new](https://github.com/new)
2. Ve a [vercel.com](https://vercel.com) → **New Project** → importa tu repo
3. En **Environment Variables**, añade las 4 variables del paso 3
4. Pulsa **Deploy** — tu app estará en `https://tu-proyecto.vercel.app`

---

## 📊 Formato del Excel de productos

| referencia | nombre | categoria | unidad | stock | stock_minimo | fila | estanteria | nivel | proveedor |
|---|---|---|---|---|---|---|---|---|---|
| CEM-001 | Cemento Portland 25kg | Cementos | saco | 100 | 20 | 1 | A | 1 | Lafarge |
| TUB-050 | Tubo PVC 50mm | Fontanería | pieza | 45 | 5 | 2 | B | 2 | Wavin |

**Unidades válidas**: `m2`, `ml`, `caja`, `pieza`, `saco`, `palet`, `ud`

---

## 📊 Formato del Excel de pedidos

| numero_pedido | nombre | apellidos | dni | empresa | telefono | obra | fecha | referencia | cantidad | unidad |
|---|---|---|---|---|---|---|---|---|---|---|
| PED-001 | Juan | García López | 12345678A | Obras SA | 600000001 | Calle Mayor 5 | 2024-01-15 | CEM-001 | 10 | saco |
| PED-001 | Juan | García López | | | | | | TUB-050 | 5 | pieza |

*Repite el número de pedido en cada línea para pedidos con varios productos.*

---

## 🗂️ Estructura del proyecto

```
almacen-app/
├── app/
│   ├── productos/          # Lista y ficha de productos
│   ├── pedidos/            # Lista y detalle de pedidos
│   ├── escanear/           # Escáner QR por cámara
│   ├── asistente/          # Chat IA de diseño
│   ├── admin/              # Panel de administración
│   └── api/asistente/      # API route para Claude
├── components/
│   ├── layout/             # Nav y AppLayout
│   └── ui/                 # UbicacionBadge, StockIndicator
├── lib/
│   ├── supabase.ts         # Cliente Supabase
│   ├── excel.ts            # Parseo de Excel
│   └── utils.ts            # Helpers y constantes
├── types/index.ts          # TypeScript types
└── supabase-schema.sql     # SQL para crear las tablas
```

---

## 🔧 Stack tecnológico

| Tecnología | Uso | Coste |
|---|---|---|
| Next.js 14 | Framework web | Gratis |
| Supabase | Base de datos + Auth | Gratis (500MB) |
| Vercel | Hosting | Gratis |
| Anthropic Claude | IA del asistente | ~$0.01/consulta |
| html5-qrcode | Escáner QR | Gratis |

---

## 📱 Uso en móvil

La app está optimizada para uso en almacén con el móvil en la mano:
- Navegación por barra inferior
- Escáner QR con la cámara trasera
- Ubicaciones destacadas en naranja para localización rápida
