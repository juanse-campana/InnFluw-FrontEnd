# Plan de Implementación: Frontend InnFluw para Backend API v1

> Documento de planificación para adaptar el frontend al backend documentado en `APIDOCS.md`

## Índice

1. [Estado Actual vs Requerido](#1-estado-actual-vs-requerido)
2. [FASE 1: Actualización de Tipos TypeScript](#2-fase-1-actualización-de-tipos-typescript)
3. [FASE 2: Actualización del API Client](#3-fase-2-actualización-del-api-client)
4. [FASE 4: Páginas de Autenticación](#4-fase-4-páginas-de-autenticación)
5. [FASE 5: Landing Page Pública del Drop](#5-fase-5-landing-page-pública-del-drop)
6. [FASE 6: Dashboard y Analytics](#6-fase-6-dashboard-y-analytics)
7. [FASE 7: Página de Detalle/Edición de Drop](#7-fase-7-página-de-detalleedición-de-drop)
8. [FASE 8: Gestión de Órdenes](#8-fase-8-gestión-de-órdenes)
9. [FASE 9: Códigos de Descuento](#9-fase-9-códigos-de-descuento)
10. [FASE 10: Webhooks](#10-fase-10-webhooks)
11. [FASE 11: Upload de Archivos](#11-fase-11-upload-de-archivos)
12. [Orden de Implementación Recomendado](#12-orden-de-implementación-recomendado)

---

## 1. Estado Actual vs Requerido

### Estructura de Carpetas Actual

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   │   └── verify/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── drops/
│   │   │   ├── new/
│   │   │   └── [id]/edit/
│   │   ├── orders/
│   │   ├── analytics/
│   │   ├── discount-codes/
│   │   ├── webhooks/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── drops/[id]/view/
│   ├── checkout/[token]/
│   ├── page.tsx
│   └── layout.tsx
├── components/
├── lib/api/index.ts
└── types/index.ts
```

### Brechas Identificadas

| Componente                | Estado          | Requiere                             |
| ------------------------- | --------------- | ------------------------------------ |
| Tipos TypeScript          | Incompleto      | Actualización completa               |
| API Client                | Incompleto      | Agregar endpoints faltantes          |
| Auth: verify-email        | **FALTA**       | Crear página                         |
| Auth: resend-verification | **FALTA**       | Crear página/formulario              |
| Auth: verify OTP          | Ruta incorrecta | Mover a `/auth/verify`               |
| Landing Page `/d/[slug]`  | **FALTA**       | Crear página pública completa        |
| Confirmación Orden        | **FALTA**       | Crear `/order/confirm/[token]`       |
| Analytics por Drop        | **FALTA**       | Crear página `/drops/[id]/analytics` |
| DropConfig en vistas      | Parcial         | Implementar personalización visual   |

---

## 2. FASE 1: Actualización de Tipos TypeScript

**Archivo:** `src/types/index.ts`

### 2.1 Interfaz User

**Referencia:** `APIDOCS.md` líneas 388-397

```typescript
// ACTUAL
export interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// REQUERIDO
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "INFLUENCER" | "ADMIN";
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 2.2 Interfaz Drop

**Referencia:** `APIDOCS.md` líneas 399-417

**Cambios:**

- Cambiar status de `"DRAFT" | "LIVE" | "PAUSED" | "SOLD_OUT"` a `"DRAFT" | "COMING_SOON" | "LIVE" | "SOLD_OUT" | "ENDED"`
- Agregar campos: `productImage`, `isActive`, `userId`
- Reemplazar `views`, `visitors`, `orders`, `revenue` por `_count?: { orders: number; visitors: number }`
- Mantener `user?: { id: string; name: string; avatar?: string }`

### 2.3 Nueva Interfaz DropConfig

**Referencia:** `APIDOCS.md` líneas 419-429

```typescript
export interface DropConfig {
  theme?: {
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
  };
  branding?: {
    logo?: string;
    favicon?: string;
    heroImage?: string;
    ogImage?: string;
  };
  content?: {
    headline?: string;
    subheadline?: string;
    description?: string;
    ctaText?: string;
    footerText?: string;
  };
  layout?: {
    template?: string;
    boxedWidth?: number;
    padding?: number;
  };
  products?: {
    showStock?: boolean;
    showPrices?: boolean;
    currency?: string;
  };
  checkout?: {
    successRedirect?: string;
    emailCustomMessage?: string;
  };
  social?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  customCss?: string;
  meta?: {
    title?: string;
    description?: string;
  };
}
```

### 2.4 Interfaz DiscountCode

**Referencia:** `APIDOCS.md` líneas 431-444

**Cambios:**

- Cambiar `type: "PERCENTAGE" | "FIXED"` a `type: "PERCENTAGE" | "FIXED_AMOUNT"`
- Cambiar `usedCount` por `uses`
- Agregar relaciones: `drops?: Array<{ drop: { id: string; title: string; slug: string } }>`
- Agregar `_count?: { orders: number }`

### 2.5 Interfaz Order

**Referencia:** `APIDOCS.md` líneas 446-465

**Cambios:**

- Cambiar `status: "CANCELLED"` a incluir opciones según API
- Agregar `drop: { id: string; title: string; slug: string }`
- Agregar `discountCode?: { id: string; code: string }`
- Remover `quantity` (no existe en el backend)
- Remover `dropId` como campo directo (está anidado)

### 2.6 Nuevas Interfaces

Agregar las siguientes interfaces nuevas:

```typescript
// Referencia: APIDOCS.md líneas 467-484
export interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  status: string;
  statusCode?: number;
  response?: string;
  error?: string;
  webhookId: string;
  dropId?: string;
  orderId?: string;
  createdAt: string;
}

export interface Visitor {
  id: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}
```

### 2.7 Actualizar ApiResponse

**Referencia:** `APIDOCS.md` líneas 361-371

El formato de error del backend es:

```typescript
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Error de validación",
    errors: [{ path: ["email"], message: "Email inválido" }]
  }
}
```

**Tarea:** Crear interfaz de error unificada:

```typescript
export interface ApiError {
  code: string;
  message: string;
  errors?: Array<{ path: string[]; message: string }>;
}
```

### 2.8 Nuevos Tipos de Response para Analytics

**Referencia:** `APIDOCS.md` líneas 272-299

```typescript
export interface DashboardAnalytics {
  period: { start: string; end: string };
  summary: {
    totalDrops: number;
    activeDrops: number;
    totalVisitors: number;
    totalOrders: number;
    totalRevenue: number;
  };
  recentOrders: Order[];
}

export interface DropAnalytics {
  dropId: string;
  period: string;
  summary: {
    visitors: number;
    orders: number;
    revenue: number;
    totalDiscount: number;
    conversionRate: number;
  };
  topCodes: Array<{
    code: string;
    uses: number;
    discount: number;
  }>;
  dailyStats: {
    visitors: Array<{ date: string; count: number }>;
    orders: Array<{ date: string; count: number }>;
  };
}
```

---

## 3. FASE 2: Actualización del API Client

**Archivo:** `src/lib/api/index.ts`

### 3.1 Actualizar authApi

**Referencia:** `APIDOCS.md` líneas 68-110

**Agregar métodos faltantes:**

```typescript
export const authApi = {
  // ... métodos existentes ...

  // AGREGAR: Verificar email con token (línea 80-83)
  verifyEmail: async (token: string) => {
    const response = await api.get("/auth/verify-email", {
      params: { token },
    });
    return response.data;
  },

  // AGREGAR: Reenviar email de verificación (línea 85-88)
  resendVerification: async (email: string) => {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
  },
};
```

### 3.2 Actualizar dropsApi

**Referencia:** `APIDOCS.md` líneas 112-178

**Agregar parámetros faltantes a getAll:**

```typescript
getAll: async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;  // AGREGAR según línea 118
}) => {
  const response = await api.get("/drops", { params });
  return response.data;
},
```

### 3.3 Actualizar discountCodesApi

**Referencia:** `APIDOCS.md` líneas 180-224

**Modificar método validate (línea 194-197):**

```typescript
validate: async (code: string, dropId?: string, amount?: number) => {
  const response = await api.get("/discount-codes/validate", {
    params: { code, dropId, amount },  // AGREGAR amount según línea 195
  });
  return response.data;
},
```

### 3.4 Actualizar analyticsApi

**Referencia:** `APIDOCS.md` líneas 272-299

**Agregar parámetro period:**

```typescript
export const analyticsApi = {
  getDashboard: async (period: "7d" | "30d" | "90d" = "30d") => {
    const response = await api.get("/analytics/dashboard", {
      params: { period }, // Agregar según línea 276
    });
    return response.data;
  },
  getDropAnalytics: async (
    dropId: string,
    period: "7d" | "30d" | "90d" = "30d",
  ) => {
    const response = await api.get(`/analytics/drops/${dropId}`, {
      params: { period }, // Agregar según línea 288
    });
    return response.data;
  },
};
```

### 3.5 Agregar nuevo endpoint de Health

**Referencia:** `APIDOCS.md` líneas 344-350

```typescript
export const healthApi = {
  check: async () => {
    const response = await api.get("/health");
    return response.data;
  },
};
```

---

## 4. FASE 4: Páginas de Autenticación

### 4.1 Crear página de verificación de email

**Archivo:** `src/app/(auth)/verify-email/page.tsx`

**Ruta:** `/auth/verify-email?token=xxx`

**Referencia:** `APIDOCS.md` líneas 80-83

```typescript
// Endpoint: GET /auth/verify-email?token=xxx
// Auth: No requerido
// Response: { success, message: "Email verificado exitosamente" }
```

**Funcionalidades:**

1. Extraer `token` de query params
2. Llamar a `authApi.verifyEmail(token)`
3. Mostrar mensaje de éxito
4. Si hay error, mostrar mensaje de error
5. Botón para reenviar email si es necesario
6. Link para ir a login después de verificación exitosa

### 4.2 Crear página de reenvío de verificación

**Archivo:** `src/app/(auth)/resend-verification/page.tsx`

**Ruta:** `/auth/resend-verification`

**Referencia:** `APIDOCS.md` líneas 85-88

```typescript
// Endpoint: POST /auth/resend-verification
// Body: { email }
// Response: { success, message: "Email de verificación reenviado" }
```

**Funcionalidades:**

1. Formulario con campo email
2. Validación con Zod
3. Llamar a `authApi.resendVerification(email)`
4. Mostrar mensaje de éxito
5. Link para volver a login

### 4.3 Actualizar flujo de Register

**Archivo:** `src/app/(auth)/register/page.tsx`

**Referencia:** `APIDOCS.md` líneas 71-78

**Actualizar mensaje post-registro:**

```typescript
// Response incluye: message: "Usuario creado exitosamente. Por favor verifica tu email."
// Campos: { id, email, name, emailVerified: false, createdAt }
```

**Cambios:**

1. Mostrar mensaje específico: "Usuario creado exitosamente. Por favor verifica tu email."
2. Agregar botón "Reenviar email" que llame a `/auth/resend-verification`
3. Redirección a `/auth/verify-email?token=...` NO es automática (el usuario recibe el link por email)

### 4.4 Actualizar página de Login

**Archivo:** `src/app/(auth)/login/page.tsx`

**Referencia:** `APIDOCS.md` líneas 90-98

**Flujo actual:**

```
1. POST /auth/login → { email, password } → "Código OTP enviado a tu email"
2. POST /auth/verify-otp → { email, code } → { token, user }
```

**Cambios:**

1. Después de login exitoso, redirigir a `/auth/verify` con el email
2. En `/auth/verify`, mostrar input para código OTP de 6 dígitos
3. Llamar a `authApi.verifyOtp({ email, code })`
4. Guardar token en localStorage
5. Redirigir a dashboard

### 4.5 Crear página Verify OTP

**Archivo:** `src/app/(auth)/verify/page.tsx`

**Ruta:** `/auth/verify`

**Referencia:** `APIDOCS.md` líneas 95-98

```typescript
// Endpoint: POST /auth/verify-otp
// Body: { email, code }
// Response: { success, message, data: { token, user: { id, email, name, role } } }
```

**Funcionalidades:**

1. Recibir `email` por query param o state
2. Input para código OTP de 6 dígitos
3. Countdown de 5 minutos hasta reenvío (referencia: `APIDOCS.md` línea 47)
4. Máximo 5 intentos (referencia: `APIDOCS.md` línea 616)
5. Botón reenviar después de timeout
6. Al verificar, guardar token y redirigir a `/`

### 4.6 Actualizar AuthProvider

**Archivo:** `src/components/providers/auth-provider.tsx`

**Cambios:** 1.掉认 `role` 字段: `'INFLUENCER' | 'ADMIN'` 2. 确保 `emailVerified` 字段被正确处理 3. 如果 `emailVerified === false`，显示提醒让用户验证邮箱

---

## 5. FASE 5: Landing Page Pública del Drop

### 5.1 Crear página de landing

**Archivo:** `src/app/drops/[slug]/page.tsx` (nueva estructura)

**Ruta:** `/d/[slug]`

**Referencia:** `APIDOCS.md` líneas 542-571

```typescript
// Endpoint: GET /drops/slug/:slug
// Auth: No requerido
// Response: { success, data: { drop: { ..., user: { name, avatar } } } }
```

**Estructura de la página:**

```typescript
interface CheckoutPageProps {
  drop: {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    price: number;
    stock: number;
    productImage?: string;
    status: "LIVE" | "COMING_SOON" | "SOLD_OUT";
    config: DropConfig;
    user: { name: string; avatar?: string };
  };
}
```

### 5.2 Funcionalidades obligatorias

**Referencia:** `APIDOCS.md` líneas 564-570

#### 5.2.1 Trackear visitante

```typescript
// Endpoint: POST /drops/track-visitor
// Body: { dropId, sessionId? }
// Response: { success, data: { visitorId } }

// Implementar en useEffect al cargar la página
useEffect(() => {
  const sessionId = sessionStorage.getItem("sessionId") || crypto.randomUUID();
  sessionStorage.setItem("sessionId", sessionId);

  dropsApi.trackVisitor({ dropId: drop.id, sessionId });
}, [drop.id]);
```

#### 5.2.2 Aplicar DropConfig para personalización

**Referencia:** `APIDOCS.md` líneas 419-429

```typescript
// Aplicar theme.colors si existe
const bgColor = drop.config?.theme?.colors?.background || "bg-white";
const textColor = drop.config?.theme?.colors?.text || "text-gray-900";
const primaryColor = drop.config?.theme?.colors?.primary || "bg-black";

// Usar content.headline si existe
const headline = drop.config?.content?.headline || drop.title;
const ctaText = drop.config?.content?.ctaText || "Comprar ahora";
```

#### 5.2.3 Validación de código de descuento en tiempo real

**Referencia:** `APIDOCS.md` línea 566

```typescript
// Endpoint: GET /discount-codes/validate?code=XXX&dropId=XXX&amount=XXX
// Auth: No

const handleDiscountCodeChange = async (code: string) => {
  if (!code) {
    setDiscountValid(null);
    return;
  }

  const response = await discountCodesApi.validate(code, drop.id, drop.price);
  setDiscountValid(response.data);
};
```

#### 5.2.4 Formulario de checkout

**Referencia:** `APIDOCS.md` líneas 228-253

```typescript
// Endpoint: POST /checkout/simulate
// Body: {
//   dropId: string,
//   discountCode?: string,
//   buyerEmail: string,
//   buyerName: string,
//   buyerPhone?: string,
//   buyerAddress?: string,
//   buyerCity?: string,
//   buyerCountry?: string
// }
// Response: {
//   success,
//   data: {
//     order: {
//       id,
//       status: "PENDING",
//       total,
//       confirmationUrl
//     }
//   }
// }
```

**Campos del formulario:**

- buyerEmail (requerido)
- buyerName (requerido)
- buyerPhone (opcional)
- buyerAddress (opcional)
- buyerCity (opcional)
- buyerCountry (opcional)
- discountCode (opcional)

#### 5.2.5 Redirección post-confirmación

**Referencia:** `APIDOCS.md` líneas 156, 569

```typescript
// Si drop.config.checkout.successRedirect existe, usar esa URL
// Si no existe, mostrar página de confirmación local

const handleOrderCreated = (order: Order) => {
  if (drop.config?.checkout?.successRedirect) {
    window.location.href = `${drop.config.checkout.successRedirect}?orderId=${order.id}`;
  } else {
    router.push(`/checkout/${order.confirmationToken}`);
  }
};
```

### 5.3 Estados del producto

```typescript
// Referencia: APIDOCS.md línea 148
type DropStatus = "DRAFT" | "COMING_SOON" | "LIVE" | "SOLD_OUT" | "ENDED";

// Mostrar según status:
case "COMING_SOON":
  return <div>¡Próximamente! Fecha de lanzamiento: ...</div>;
case "SOLD_OUT":
  return <div>¡Agotado!</div>;
case "ENDED":
  return <div>Esta promoción ha terminado</div>;
```

---

## 6. FASE 6: Dashboard y Analytics

### 6.1 Actualizar Dashboard principal

**Archivo:** `src/app/(dashboard)/page.tsx`

**Referencia:** `APIDOCS.md` líneas 272-285

```typescript
// Endpoint: GET /analytics/dashboard?period=7d|30d|90d
// Response: {
//   period: { start, end },
//   summary: { totalDrops, activeDrops, totalVisitors, totalOrders, totalRevenue },
//   recentOrders: [...]
// }
```

**Componentes a mostrar:**

1. Cards con métricas:
   - Total Drops vs Active Drops
   - Total Visitors
   - Total Orders
   - Total Revenue
2. Selector de período (7d, 30d, 90d)
3. Lista de recentOrders

### 6.2 Crear página de Analytics por Drop

**Archivo:** `src/app/(dashboard)/drops/[id]/analytics/page.tsx` (nuevo)

**Ruta:** `/drops/[id]/analytics`

**Referencia:** `APIDOCS.md` líneas 287-299

```typescript
// Endpoint: GET /analytics/drops/:id?period=7d|30d|90d
// Response: {
//   dropId, period,
//   summary: { visitors, orders, revenue, totalDiscount, conversionRate },
//   topCodes: [...],
//   dailyStats: { visitors: [...], orders: [...] }
// }
```

**Componentes:**

1. Selector de período
2. Cards con métricas: Visitors, Orders, Revenue, Conversion Rate
3. Gráfico de visitantes diarios (dailyStats.visitors)
4. Gráfico de órdenes diarias (dailyStats.orders)
5. Tabla de topCodes con uso y descuento aplicado
6. Totales de descuento aplicado

### 6.3 Actualizar selector de período

**Referencia:** `APIDOCS.md` línea 276

```typescript
type Period = "7d" | "30d" | "90d";

// Usar en ambos endpoints de analytics
const [period, setPeriod] = useState<Period>("30d");
const { data } = useQuery({
  queryKey: ["dashboard", period],
  queryFn: () => analyticsApi.getDashboard(period),
});
```

---

## 7. FASE 7: Página de Detalle/Edición de Drop

### 7.1 Actualizar endpoint getById

**Archivo:** `src/app/(dashboard)/drops/[id]/edit/page.tsx`

**Referencia:** `APIDOCS.md` líneas 127-130

```typescript
// Endpoint: GET /drops/:id
// Response: { success, data: { drop: { ..., discountCodes, _count: { orders, visitors } } } }
```

**Cambios en la UI:**

1. Mostrar `_count.orders` y `_count.visitors`
2. Agregar sección de códigos de descuento asociados (discountCodes)
3. Link a `/drops/[id]/analytics` para ver estadísticas detalladas

### 7.2 Actualizar formulario de creación/edición

**Referencia:** `APIDOCS.md` líneas 137-161

**Body para crear/actualizar drop:**

```typescript
interface DropFormData {
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  productImage?: string;
  status: "DRAFT" | "COMING_SOON" | "LIVE" | "SOLD_OUT" | "ENDED";
  config?: {
    theme?: { colors?: {...}, fonts?: {...} };
    branding?: { logo?, favicon?, heroImage?, ogImage? };
    content?: { headline?, subheadline?, description?, ctaText?, footerText? };
    layout?: { template?, boxedWidth?, padding? };
    products?: { showStock?, showPrices?, currency? };
    checkout?: { successRedirect?, emailCustomMessage? };
    social?: { instagram?, twitter?, tiktok? };
    customCss?: string;
    meta?: { title?, description? };
  };
}
```

### 7.3 Agregar selector de status

**Archivo:** компоненты UI для редактирования статуса

**Estados válidos (referencia: `APIDOCS.md` línea 148):**

```typescript
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Borrador" },
  { value: "COMING_SOON", label: "Próximamente" },
  { value: "LIVE", label: "En Vivo" },
  { value: "SOLD_OUT", label: "Agotado" },
  { value: "ENDED", label: "Terminado" },
];
```

### 7.4 Agregar link a Analytics en detalle

```typescript
// En la página de detalle del drop
<Link href={`/drops/${drop.id}/analytics`}>
  Ver estadísticas detalladas
</Link>
```

---

## 8. FASE 8: Gestión de Órdenes

### 8.1 Actualizar lista de órdenes

**Archivo:** `src/app/(dashboard)/orders/page.tsx`

**Referencia:** `APIDOCS.md` líneas 255-259

```typescript
// Endpoint: GET /checkout/orders?dropId?&status?&page?&limit?
// Response: { success, data: { orders, pagination } }
```

**Actualizar tabla:**

1. Usar `pagination` para paginación
2. Incluir filtros por `dropId` y `status`
3. Mostrar `drop.title` en lugar de solo `dropId`
4. Mostrar `discountCode.code` si existe

### 8.2 Actualizar detalle de orden

**Archivo:** `src/app/(dashboard)/orders/[id]/page.tsx`

**Referencia:** `APIDOCS.md` líneas 261-264

```typescript
// Endpoint: GET /checkout/orders/:id
// Response: { success, data: { order } }
```

**Campos a mostrar:**

- Información del buyer (email, name, phone, address, city, country)
- Subtotal, discount, total
- Status de la orden
- drop.title
- discountCode.code si aplicó
- Fechas: createdAt, confirmedAt

### 8.3 Crear página de confirmación de orden

**Archivo:** `src/app/checkout/[token]/page.tsx` (actualizar o crear)

**Ruta:** `/checkout/[token]`

**Referencia:** `APIDOCS.md` líneas 266-269

```typescript
// Endpoint: POST /checkout/confirm/:token
// Auth: No
// Response: { success, message, data: { order: { id, status: "CONFIRMED", confirmedAt } } }
```

**Funcionalidades:**

1. Extraer `token` de la URL
2. Llamar a `checkoutApi.confirm(token)` al cargar
3. Mostrar estado de confirmación exitoso
4. Mostrar detalles de la orden
5. Posible redirección a `successRedirect` del config

---

## 9. FASE 9: Códigos de Descuento

### 9.1 Actualizar formulario de creación

**Archivo:** `src/app/(dashboard)/discount-codes/new/page.tsx`

**Referencia:** `APIDOCS.md` líneas 199-212

```typescript
interface DiscountCodeFormData {
  code: string; // Se uppercasing automático
  type: "PERCENTAGE" | "FIXED_AMOUNT"; // Cambiar de "FIXED" a "FIXED_AMOUNT"
  value: number;
  minAmount?: number;
  maxUses?: number;
  expiresAt?: string; // ISO datetime
  isActive?: boolean;
  dropIds: string[]; // Mínimo 1 UUID
}
```

### 9.2 Selector de tipo

```typescript
// Actualizar opciones según APIDOCS.md línea 204
const TYPE_OPTIONS = [
  { value: "PERCENTAGE", label: "Porcentaje (%)" },
  { value: "FIXED_AMOUNT", label: "Monto fijo ($)" },
];
```

### 9.3 Selector de drops asociados

```typescript
// Campo dropIds: array de UUIDs
// Mínimo 1 requerido
// Mostrar selector múltiple de drops del usuario
```

---

## 10. FASE 10: Webhooks

### 10.1 Actualizar página de Webhooks

**Archivo:** `src/app/(dashboard)/webhooks/page.tsx`

**Referencia:** `APIDOCS.md` líneas 301-325

**Eventos disponibles (línea 313):**

```typescript
const AVAILABLE_EVENTS = ["order.created", "order.confirmed", "drop.stock.low"];
```

### 10.2 Mostrar logs de deliveries

**Referencia:** `APIDOCS.md` líneas 321-324

```typescript
// Endpoint: GET /webhooks/:id/logs?limit=20
// Response: { success, data: { deliveries: [...] } }
```

**Agregar sección en detalle de webhook:**

- Tabla con deliveries
- Columnas: status, statusCode, response, error, createdAt
- Indicador visual de éxito/fallo

---

## 11. FASE 11: Upload de Archivos

### 11.1 Actualizar función de upload

**Archivo:** `src/lib/api/index.ts` (uploadApi)

**Referencia:** `APIDOCS.md` líneas 327-336

```typescript
// Endpoint: POST /upload
// Auth: Bearer token
// Content-Type: multipart/form-data
// Body: { file: File }
// Restricciones: jpg, png, gif, webp, svg | máx 5MB
// Response: { success, message, data: { url, filename, originalName, size, mimetype } }
```

**Agregar validación del lado cliente:**

```typescript
export const uploadApi = {
  upload: async (file: File) => {
    // Validaciones
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error(
        "Tipo de archivo no permitido. Usar: jpg, png, gif, webp, svg",
      );
    }

    if (file.size > maxSize) {
      throw new Error("El archivo excede el límite de 5MB");
    }

    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
```

### 11.2 Componente de upload reutilizable

**Archivo:** `src/components/ui/image-upload.tsx` (crear)

**Funcionalidades:**

1. Drag & drop zone
2. Preview de imagen
3. Progress bar
4. Validación de tipo y tamaño
5. Manejo de errores

---

## 12. Orden de Implementación Recomendado

### Fase 1: Fundamentos (Crítico)

1. **[ ] 2.1-2.8** - Actualizar `src/types/index.ts`
2. **[ ] 3.1-3.5** - Actualizar `src/lib/api/index.ts`

### Fase 2: Autenticación

3. **[ ] 4.1** - Crear `/auth/verify-email`
4. **[ ] 4.2** - Crear `/auth/resend-verification`
5. **[ ] 4.3** - Actualizar Register con mensaje correcto
6. **[ ] 4.4** - Actualizar Login para redirigir a Verify
7. **[ ] 4.5** - Crear `/auth/verify` (Verify OTP)
8. **[ ] 4.6** - Actualizar AuthProvider

### Fase 3: Landing Page (Crítico para usuarios finales)

9. **[ ] 5.1-5.2** - Crear `/d/[slug]` básica
10. **[ ] 5.3.1** - Implementar trackVisitor
11. **[ ] 5.3.2** - Aplicar DropConfig
12. **[ ] 5.3.3** - Validación de descuento en tiempo real
13. **[ ] 5.3.4** - Formulario de checkout
14. **[ ] 5.3.5** - Redirección post-confirmación

### Fase 4: Dashboard

15. **[ ] 6.1** - Actualizar Dashboard principal con analytics
16. **[ ] 6.2** - Crear `/drops/[id]/analytics`
17. **[ ] 6.3** - Actualizar selector de período

### Fase 5: Gestión de Drops

18. **[ ] 7.1** - Actualizar detalle de drop con \_count
19. **[ ] 7.2** - Actualizar formulario con config completo
20. **[ ] 7.3** - Agregar selector de status
21. **[ ] 7.4** - Agregar link a analytics

### Fase 6: Órdenes

22. **[ ] 8.1** - Actualizar lista de órdenes
23. **[ ] 8.2** - Actualizar detalle de orden
24. **[ ] 8.3** - Crear página de confirmación

### Fase 7: Códigos de Descuento

25. **[ ] 9.1** - Actualizar formulario de creación
26. **[ ] 9.2-9.3** - Selector de tipo y drops

### Fase 8: Webhooks

27. **[ ] 10.1** - Actualizar página de webhooks
28. **[ ] 10.2** - Mostrar logs de deliveries

### Fase 9: Upload

29. **[ ] 11.1** - Actualizar función de upload
30. **[ ] 11.2** - Crear componente reutilizable

---

## Notas Adicionales

### Rate Limits

**Referencia:** `APIDOCS.md` línea 614

> Implementar exponential backoff en caso de 429

```typescript
// En api interceptors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      // Implementar exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * 2 ** retryCount),
      );
      return api(originalRequest);
    }
    return Promise.reject(error);
  },
);
```

### Slug Validation

**Referencia:** `APIDOCS.md` línea 142, 619

> Formato: `/^[a-z0-9-]+$/` (lowercase con guiones)
> Auto-generar desde title si vacío

```typescript
// Función helper para generar slug
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};
```

### Formato de Errores

**Referencia:** `APIDOCS.md` líneas 361-371

```typescript
// En toast store, manejar errores con este formato
interface ApiError {
  code: string;
  message: string;
  errors?: Array<{ path: string[]; message: string }>;
}

// Mostrar errores de validación inline
errors?.forEach((error) => {
  const field = error.path.join(".");
  setError(field, { message: error.message });
});
```

### CORS

**Referencia:** `APIDOCS.md` línea 618

> Backend permite localhost:3000, 3001, 3002

Asegurar que el frontend esté en uno de estos puertos o actualizar el backend si es necesario.

---

## Checklist de Verificación

Después de implementar cada fase, verificar:

- [ ] Tipos TypeScript compilando sin errores
- [ ] Todos los endpoints de API respondiendo correctamente
- [ ] Autenticación completa funcionando (registro → verify email → login → verify OTP)
- [ ] Landing page cargando y aplicando personalización
- [ ] Checkout completando el flujo completo
- [ ] Dashboard mostrando datos reales
- [ ] Forms validando correctamente según schemas de backend
- [ ] Errores mostrándose correctamente al usuario
- [ ] Responsive en mobile (especialmente checkout)

---

_Documento creado basándose en `APIDOCS.md` del backend InnFluw-Back_
_Fecha de creación: 2026-03-20_
