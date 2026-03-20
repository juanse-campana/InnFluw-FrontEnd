export interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: User;
    token?: string;
  };
}

export interface Drop {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  status: "DRAFT" | "LIVE" | "PAUSED" | "SOLD_OUT";
  config?: DropConfig;
  views: number;
  visitors: number;
  orders: number;
  revenue: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DropConfig {
  theme?: {
    colors?: {
      primary?: string;
      secondary?: string;
      background?: string;
      text?: string;
    };
  };
  content?: {
    headline?: string;
    subheadline?: string;
    ctaText?: string;
    successMessage?: string;
  };
  settings?: {
    maxOrdersPerCustomer?: number;
    requireEmailVerification?: boolean;
    showStockCount?: boolean;
  };
}

export interface DiscountCode {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  dropIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  dropId: string;
  drop?: Drop;
  buyerEmail: string;
  buyerName: string;
  buyerPhone?: string;
  buyerAddress?: string;
  buyerCity?: string;
  buyerCountry?: string;
  quantity: number;
  subtotal: number;
  discount: number;
  total: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
  confirmationToken?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface CheckoutSimulation {
  dropId: string;
  discountCode?: string;
  buyerEmail: string;
  buyerName: string;
  buyerPhone?: string;
  buyerAddress?: string;
  buyerCity?: string;
  buyerCountry?: string;
}

export interface Analytics {
  totalDrops: number;
  liveDrops: number;
  totalOrders: number;
  totalRevenue: number;
  totalVisitors: number;
  conversionRate: number;
  recentOrders: Order[];
  topDrops: Drop[];
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, unknown>;
  responseStatus?: number;
  responseBody?: string;
  success: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
