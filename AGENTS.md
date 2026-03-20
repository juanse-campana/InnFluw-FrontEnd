# innfluw-front

## Project Overview

Plataforma SaaS de product drops con checkout integrado. Permite a vendedores crear landing pages de productos, gestionar pedidos y recibir pagos.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TailwindCSS 4
- **State Management**: Zustand
- **Data Fetching**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form + Zod
- **API Client**: Axios
- **Icons**: Lucide React
- **Validation**: Zod + @hookform/resolvers
- **Language**: TypeScript 5

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Auth pages
│   │   ├── login/               # Login page
│   │   ├── register/             # Registration page
│   │   │   └── verify/          # OTP verification
│   │   └── layout.tsx           # Auth layout
│   ├── (dashboard)/             # Seller dashboard (protected)
│   │   ├── page.tsx             # Dashboard home
│   │   ├── drops/               # Drops management
│   │   │   ├── page.tsx         # List all drops
│   │   │   ├── new/             # Create new drop
│   │   │   └── [id]/edit/       # Edit drop
│   │   ├── orders/              # Orders management
│   │   ├── analytics/           # Analytics dashboard
│   │   ├── discount-codes/      # Discount codes management
│   │   ├── webhooks/            # Webhooks management
│   │   ├── settings/            # User settings
│   │   └── layout.tsx           # Dashboard layout with sidebar
│   ├── drops/[id]/view/         # Public product landing page
│   ├── checkout/[token]/        # Checkout flow
│   ├── page.tsx                 # Landing/redirect
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── label.tsx
│   │   ├── alert.tsx
│   │   ├── spinner.tsx
│   │   ├── toaster.tsx
│   │   └── index.ts             # Export all UI components
│   ├── layout/                  # Layout components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── index.ts
│   └── providers/               # React providers
│       ├── auth-provider.tsx
│       ├── query-provider.tsx
│       └── index.ts
├── lib/
│   ├── api/                      # API client and endpoints
│   │   └── index.ts             # Axios instance + API functions
│   ├── store/                    # Zustand stores
│   │   └── index.ts             # Toast store, auth store
│   └── utils.ts                 # Utility functions (formatCurrency, formatDate, cn)
├── types/                        # TypeScript interfaces
│   └── index.ts
└── .env.local                   # Environment variables
```

## Coding Conventions

### File Naming

- Componentes: PascalCase (UserProfile.tsx)
- Hooks: camelCase con prefijo `use` (useAuth.ts)
- Utils/helpers: camelCase (formatCurrency.ts)
- Pages: page.tsx
- Layouts: layout.tsx

### Component Structure

```tsx
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

### Styling

- Usar TailwindCSS para todo el styling
- Usar `cn()` (clsx + tailwind-merge) para clases condicionales
- Variables de Tailwind: `text-muted-foreground`, `bg-primary`, `border-input`, etc.
- No agregar CSS custom a menos que sea necesario

### State Management

- Server state: React Query
- UI state: useState/useReducer
- Global state: Zustand stores

### Forms

- Usar React Hook Form para todos los forms
- Validación con Zod schemas
- Mostrar errores inline debajo de cada campo

## API Integration

### Base Configuration

- Base URL: `NEXT_PUBLIC_API_URL` (default: `http://localhost:3000/api/v1`)
- Auth token: stored in localStorage as `token`
- Credentials: included in requests

### Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
```

### Error Handling

- 401 responses: clear token, redirect to /login
- Other errors: show toast notification

### Available API Endpoints

| Module             | Methods                                                          |
| ------------------ | ---------------------------------------------------------------- |
| `authApi`          | register, login, verifyOtp, getProfile, updateProfile            |
| `dropsApi`         | getAll, getById, getBySlug, create, update, delete, trackVisitor |
| `discountCodesApi` | getAll, getById, validate, create, update, delete                |
| `checkoutApi`      | simulate, confirm, getOrders, getOrderById                       |
| `analyticsApi`     | getDashboard, getDropAnalytics                                   |
| `webhooksApi`      | getAll, create, delete, getLogs                                  |
| `uploadApi`        | upload                                                           |

## Available Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Create production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Common Tasks

### Create a new drop

1. Add form fields in `src/app/(dashboard)/drops/new/page.tsx`
2. Add API method in `src/lib/api/index.ts` (already exists: `dropsApi.create`)
3. Test at `/drops/new`

### Add a new UI component

1. Create component file in `src/components/ui/`
2. Export from `src/components/ui/index.ts`
3. Use in pages with `<ComponentName />`

### Add a new API endpoint

1. Add method to appropriate API object in `src/lib/api/index.ts`
2. Add TypeScript interface in `src/types/index.ts`
3. Use in component with React Query

### Add a new dashboard page

1. Create folder in `src/app/(dashboard)/`
2. Create `page.tsx` inside the folder
3. Add link in `src/components/layout/sidebar.tsx`

### Add a new type

1. Add interface to `src/types/index.ts`
2. Export from the file

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Key User Flows

1. **Auth Flow**: Register → Verify OTP → Dashboard
2. **Create Drop**: Dashboard → Drops → New Drop → Fill form → Save
3. **Purchase Flow**: Public page → Buy → Checkout form → Confirm
4. **View Analytics**: Dashboard → Analytics → View metrics
