# InnFluw Frontend

Plataforma SaaS de product drops con checkout integrado. Permite a vendedores crear landing pages de productos, gestionar pedidos y recibir pagos — todo en un solo lugar.

## 🚀 Tech Stack

| Tecnología | Propósito |
|------------|-----------|
| [Next.js 16](https://nextjs.org) | Framework React con App Router |
| [React 19](https://react.dev) | UI Library |
| [TailwindCSS 4](https://tailwindcss.com) | Styling |
| [Zustand](https://zustand.demo.pm) | Estado global |
| [@tanstack/react-query](https://tanstack.com/query) | Gestión de estado servidor |
| [React Hook Form](https://react-hook-form.com) | Formularios |
| [Zod](https://zod.dev) | Validación de schemas |
| [Axios](https://axios-http.com) | Cliente HTTP |
| [TypeScript](https://www.typescriptlang.org) | Tipado estático |

## 📁 Estructura del Proyecto

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Páginas de autenticación
│   │   ├── login/               # Inicio de sesión
│   │   ├── register/            # Registro de usuarios
│   │   │   └── verify/          # Verificación OTP
│   │   ├── verify-email/        # Verificación de email
│   │   ├── resend-verification/ # Reenvío de verificación
│   │   └── layout.tsx           # Layout de autenticación
│   │
│   ├── (dashboard)/             # Panel del vendedor (protegido)
│   │   ├── drops/               # Gestión de drops
│   │   │   ├── page.tsx         # Lista de drops
│   │   │   ├── new/             # Crear drop
│   │   │   └── [id]/
│   │   │       ├── edit/        # Editar drop
│   │   │       └── analytics/   # Analytics del drop
│   │   ├── orders/              # Gestión de pedidos
│   │   │   ├── page.tsx         # Lista de pedidos
│   │   │   └── [id]/            # Detalle de pedido
│   │   ├── analytics/           # Dashboard de análisis
│   │   ├── discount-codes/     # Códigos de descuento
│   │   │   ├── page.tsx         # Lista de códigos
│   │   │   ├── new/             # Crear código
│   │   │   └── [id]/edit/       # Editar código
│   │   ├── webhooks/           # Gestión de webhooks
│   │   ├── settings/           # Configuración de cuenta
│   │   ├── page.tsx            # Dashboard principal
│   │   └── layout.tsx          # Layout del dashboard
│   │
│   ├── drops/[id]/view/        # Landing page pública del drop
│   ├── checkout/[token]/        # Confirmación de compra
│   ├── account/[name]/         # Página pública del vendedor
│   ├── cart/                   # Carrito de compras
│   ├── page.tsx                # Landing page principal
│   └── layout.tsx              # Root layout
│
├── components/
│   ├── ui/                      # Componentes base UI
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   └── ... (shadcn/ui)
│   ├── layout/                  # Componentes de layout
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   └── providers/               # React Providers
│       ├── auth-provider.tsx
│       └── query-provider.tsx
│
├── lib/
│   ├── api/                     # Cliente API y endpoints
│   │   └── index.ts            # Axios + funciones de API
│   ├── store/                   # Zustand stores
│   │   └── index.ts            # Auth store, toast store
│   └── utils.ts                # Utilidades (cn, formatCurrency, etc.)
│
└── types/                       # Definiciones TypeScript
    └── index.ts
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo (localhost:3000)

# Producción
npm run build            # Crear build de producción
npm run start            # Iniciar servidor de producción

# Calidad de código
npm run lint             # Ejecutar ESLint
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# URL del backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Para producción, usa la URL de tu backend desplegado (ej: `https://api.tu-dominio.com/api/v1`).

### Dependencias

```bash
npm install
```

## 📱 Páginas Principales

### Autenticación

| Ruta | Descripción |
|------|-------------|
| `/login` | Inicio de sesión con OTP |
| `/register` | Registro de nuevos usuarios |
| `/register/verify` | Verificación de código OTP |
| `/verify-email` | Confirmación de email |
| `/resend-verification` | Reenvío de email de verificación |

### Dashboard (requiere auth)

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Panel principal con métricas |
| `/drops` | Lista de todos los drops |
| `/drops/new` | Crear nuevo drop |
| `/drops/[id]/edit` | Editar drop |
| `/drops/[id]/analytics` | Estadísticas detalladas del drop |
| `/orders` | Lista de pedidos |
| `/orders/[id]` | Detalle de pedido |
| `/analytics` | Dashboard de análisis general |
| `/discount-codes` | Gestión de códigos de descuento |
| `/webhooks` | Configuración de webhooks |
| `/settings` | Configuración de la cuenta |

### Públicas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page principal |
| `/d/[slug]` | Landing page pública del drop |
| `/checkout/[token]` | Página de confirmación de pedido |
| `/account/[name]` | Perfil público del vendedor |

## 🔐 Flujo de Autenticación

```
1. Registro → Email de verificación
2. Verificación de email → Activación de cuenta
3. Login → Código OTP por email
4. Verificación OTP → Acceso al dashboard
```

## 📡 API Integration

El frontend se comunica con el backend via REST API. Ver [APIDOCS.md](../InnFluw-Back/APIDOCS.md) del backend para documentación completa de endpoints.

### Endpoints Principales

| Módulo | Métodos |
|--------|---------|
| `authApi` | register, login, verifyEmail, verifyOtp, getProfile, updateProfile |
| `dropsApi` | getAll, getById, getBySlug, create, update, delete, trackVisitor |
| `discountCodesApi` | getAll, getById, validate, create, update, delete |
| `checkoutApi` | simulate, confirm, getOrders, getOrderById |
| `analyticsApi` | getDashboard, getDropAnalytics |
| `webhooksApi` | getAll, create, delete, getLogs |
| `uploadApi` | upload |

## 🎨 Convenciones de Código

### Componentes

```tsx
// Estructura de componentes de página
"use client";

import { Component } from "@/components/ui";
import { useState } from "react";

export default function PageName() {
  const [state, setState] = useState();

  return (
    <div>
      <Component />
    </div>
  );
}
```

### Nomenclatura

- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useAuth.ts`)
- **Utilidades**: camelCase (`formatCurrency.ts`)
- **Páginas**: `page.tsx`
- **Layouts**: `layout.tsx`

### Styling con Tailwind

```tsx
// Usar cn() para clases condicionales
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  isActive && "active-class",
  className
)}>

// Variables de Tailwind para temas
<div className="text-muted-foreground bg-primary border-input">
```

## 🔧 Desarrollo

### Agregar un nuevo endpoint de API

1. Agregar el método en `src/lib/api/index.ts`
2. Agregar el tipo TypeScript en `src/types/index.ts`
3. Usar con React Query:

```tsx
const { data, isLoading } = useQuery({
  queryKey: ["key"],
  queryFn: () => api.method(),
});
```

### Agregar una nueva página al dashboard

1. Crear carpeta en `src/app/(dashboard)/`
2. Crear `page.tsx` dentro
3. Agregar link en `src/components/layout/sidebar.tsx`

### Agregar un componente UI

1. Crear en `src/components/ui/`
2. Exportar desde `src/components/ui/index.ts`
3. Usar con `<ComponentName />`

## 🚢 Deploy

### Vercel (recomendado)

```bash
npm i -g vercel
vercel
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Dokploy

1. Conectar repositorio Git
2. Configurar build command: `npm run build`
3. Configurar start command: `npm run start`
4. Agregar variable de entorno: `NEXT_PUBLIC_API_URL=https://api.tu-dominio.com/api/v1`

## 📝 Licencia

MIT © 2026 InnFluw
