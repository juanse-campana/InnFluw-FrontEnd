import axios from "axios";
import type {
  Drop,
  DiscountCode,
  CheckoutSimulation,
  Order,
  OrderResponse,
  User,
  ApiResponse,
  ApiError,
  PaginatedResponse,
  DropsFilters,
  OrdersFilters,
  DiscountCodeFilters,
  DashboardAnalytics,
  DropAnalytics,
  Webhook,
  WebhookDelivery,
  UploadResponse,
  HealthResponse,
  DiscountCodeValidation,
  Period,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem("token");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const errorData = error.response.data as ApiResponse<unknown>;
    const apiError: ApiError = {
      code: errorData.error?.code || "UNKNOWN_ERROR",
      message:
        errorData.error?.message ||
        errorData.message ||
        "An unexpected error occurred",
      errors: errorData.error?.errors,
    };
    throw apiError;
  }
  throw {
    code: "NETWORK_ERROR",
    message: error instanceof Error ? error.message : "Network error occurred",
  };
};

export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
  }): Promise<ApiResponse<{ user: Partial<User> }>> => {
    try {
      const response = await api.post("/auth/register", data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  verifyEmail: async (
    token: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.get("/auth/verify-email", {
        params: { token },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  resendVerification: async (
    email: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.post("/auth/resend-verification", { email });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.post("/auth/login", data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  verifyOtp: async (data: {
    email: string;
    code: string;
  }): Promise<ApiResponse<{ token: string; user: Partial<User> }>> => {
    try {
      const response = await api.post("/auth/verify-otp", data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateProfile: async (data: {
    name?: string;
    avatar?: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    try {
      const response = await api.patch("/auth/profile", data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const dropsApi = {
  getAll: async (
    params?: DropsFilters,
  ): Promise<
    ApiResponse<{
      drops: Drop[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>
  > => {
    try {
      const response = await api.get("/drops", { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: string): Promise<ApiResponse<{ drop: Drop }>> => {
    try {
      const response = await api.get(`/drops/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getBySlug: async (slug: string): Promise<ApiResponse<{ drop: Drop }>> => {
    try {
      const response = await api.get(`/drops/slug/${slug}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (data: Partial<Drop>): Promise<ApiResponse<{ drop: Drop }>> => {
    try {
      const response = await api.post("/drops", data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (
    id: string,
    data: Partial<Drop>,
  ): Promise<ApiResponse<{ drop: Drop }>> => {
    try {
      const response = await api.patch(`/drops/${id}`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.delete(`/drops/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  trackVisitor: async (data: {
    dropId: string;
    sessionId?: string;
  }): Promise<ApiResponse<{ visitorId: string }>> => {
    try {
      const response = await api.post("/drops/track-visitor", data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const discountCodesApi = {
  getAll: async (
    params?: DiscountCodeFilters,
  ): Promise<ApiResponse<{ codes: DiscountCode[] }>> => {
    try {
      const response = await api.get("/discount-codes", { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: string): Promise<ApiResponse<{ code: DiscountCode }>> => {
    try {
      const response = await api.get(`/discount-codes/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  validate: async (
    code: string,
    dropId?: string,
    amount?: number,
  ): Promise<ApiResponse<DiscountCodeValidation>> => {
    try {
      const response = await api.get("/discount-codes/validate", {
        params: { code, dropId, amount },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (
    data: Partial<DiscountCode>,
  ): Promise<ApiResponse<{ code: DiscountCode }>> => {
    try {
      const response = await api.post("/discount-codes", data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (
    id: string,
    data: Partial<DiscountCode>,
  ): Promise<ApiResponse<{ code: DiscountCode }>> => {
    try {
      const response = await api.patch(`/discount-codes/${id}`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.delete(`/discount-codes/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const checkoutApi = {
  simulate: async (
    data: CheckoutSimulation,
  ): Promise<ApiResponse<{ order: OrderResponse }>> => {
    try {
      const response = await api.post("/checkout/simulate", data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  confirm: async (
    token: string,
  ): Promise<ApiResponse<{ order: OrderResponse }>> => {
    try {
      const response = await api.post(`/checkout/confirm/${token}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getOrders: async (
    params?: OrdersFilters,
  ): Promise<
    ApiResponse<{
      orders: Order[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>
  > => {
    try {
      const response = await api.get("/checkout/orders", { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getOrderById: async (id: string): Promise<ApiResponse<{ order: Order }>> => {
    try {
      const response = await api.get(`/checkout/orders/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const analyticsApi = {
  getDashboard: async (
    period: Period = "30d",
  ): Promise<ApiResponse<DashboardAnalytics>> => {
    try {
      const response = await api.get("/analytics/dashboard", {
        params: { period },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getDropAnalytics: async (
    dropId: string,
    period: Period = "30d",
  ): Promise<ApiResponse<DropAnalytics>> => {
    try {
      const response = await api.get(`/analytics/drops/${dropId}`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const webhooksApi = {
  getAll: async (): Promise<ApiResponse<{ webhooks: Webhook[] }>> => {
    try {
      const response = await api.get("/webhooks");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  create: async (data: {
    url: string;
    events: string[];
  }): Promise<ApiResponse<{ webhook: Webhook }>> => {
    try {
      const response = await api.post("/webhooks", data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.delete(`/webhooks/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getLogs: async (
    webhookId: string,
    limit: number = 20,
  ): Promise<ApiResponse<{ deliveries: WebhookDelivery[] }>> => {
    try {
      const response = await api.get(`/webhooks/${webhookId}/logs`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const uploadApi = {
  upload: async (file: File): Promise<ApiResponse<UploadResponse>> => {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      throw {
        code: "VALIDATION_ERROR",
        message: "Tipo de archivo no permitido. Usar: jpg, png, gif, webp, svg",
      };
    }

    if (file.size > maxSize) {
      throw {
        code: "VALIDATION_ERROR",
        message: "El archivo excede el límite de 5MB",
      };
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const healthApi = {
  check: async (): Promise<HealthResponse> => {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};
