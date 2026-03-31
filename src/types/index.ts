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

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: Partial<User>;
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
  productImage?: string;
  isActive: boolean;
  status: "DRAFT" | "COMING_SOON" | "LIVE" | "SOLD_OUT" | "ENDED";
  config?: DropConfig;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: { id: string; name: string; avatar?: string };
  discountCodes?: DiscountCode[];
  _count?: { orders: number; visitors: number };
}

export interface CartItem {
  drop: Drop;
  quantity: number;
  addedAt: string;
}

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

export interface DiscountCode {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minAmount?: number;
  maxUses?: number;
  uses: number;
  expiresAt?: string;
  isActive: boolean;
  dropIds: string[];
  drops?: Array<{
    discountCodeId: string;
    dropId: string;
    drop: { id: string; title: string; slug: string };
  }>;
  _count?: { orders: number };
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  buyerEmail: string;
  buyerName: string;
  buyerPhone?: string;
  buyerAddress?: string;
  buyerCity?: string;
  buyerCountry?: string;
  subtotal: number;
  discount: number;
  total: number;
  status: "PENDING" | "CONFIRMED" | "REFUNDED";
  confirmationToken?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
  drop: { id: string; title: string; slug: string };
  discountCode?: { id: string; code: string };
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

export interface OrderResponse {
  id: string;
  status: "PENDING" | "CONFIRMED" | "REFUNDED";
  total: number;
  confirmationUrl?: string;
  confirmedAt?: string;
}

export interface DashboardAnalytics {
  period: { start: string; end: string };
  summary: {
    totalDrops: number;
    activeDrops: number;
    totalVisitors: number;
    totalOrders: number;
    totalRevenue: number;
    conversionRate: number;
  };
  topDrops: Array<{
    id: string;
    title: string;
    orders: number;
    revenue: number;
  }>;
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

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiError;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  code: string;
  message: string;
  errors?: Array<{ path: string[]; message: string }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface DropsFilters extends PaginationParams {
  status?: string;
  category?: string;
}

export interface OrdersFilters extends PaginationParams {
  dropId?: string;
  status?: string;
}

export interface DiscountCodeFilters {
  isActive?: boolean;
}

export interface UploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export interface HealthResponse {
  success: boolean;
  data: {
    status: string;
    app: string;
    version: string;
    timestamp: string;
    uptime: number;
  };
}

export interface DiscountCodeValidation {
  valid: boolean;
  code?: DiscountCode;
  reason?: string;
}

export type Period = "7d" | "30d" | "90d";
