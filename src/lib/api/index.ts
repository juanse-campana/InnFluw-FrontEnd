import axios from "axios";
import type { Drop, DiscountCode, CheckoutSimulation } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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
  }
);

export const authApi = {
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },
  login: async (data: { email: string; password: string }) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },
  verifyOtp: async (data: { email: string; code: string }) => {
    const response = await api.post("/auth/verify-otp", data);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
  updateProfile: async (data: { name?: string }) => {
    const response = await api.patch("/auth/profile", data);
    return response.data;
  },
};

export const dropsApi = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get("/drops", { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/drops/${id}`);
    return response.data;
  },
  getBySlug: async (slug: string) => {
    const response = await api.get(`/drops/slug/${slug}`);
    return response.data;
  },
  create: async (data: Partial<Drop>) => {
    const response = await api.post("/drops", data);
    return response.data;
  },
  update: async (id: string, data: Partial<Drop>) => {
    const response = await api.patch(`/drops/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/drops/${id}`);
    return response.data;
  },
  trackVisitor: async (data: { dropId: string; sessionId?: string }) => {
    const response = await api.post("/drops/track-visitor", data);
    return response.data;
  },
};

export const discountCodesApi = {
  getAll: async () => {
    const response = await api.get("/discount-codes");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/discount-codes/${id}`);
    return response.data;
  },
  validate: async (code: string, dropId?: string) => {
    const response = await api.get("/discount-codes/validate", {
      params: { code, dropId },
    });
    return response.data;
  },
  create: async (data: Partial<DiscountCode>) => {
    const response = await api.post("/discount-codes", data);
    return response.data;
  },
  update: async (id: string, data: Partial<DiscountCode>) => {
    const response = await api.patch(`/discount-codes/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/discount-codes/${id}`);
    return response.data;
  },
};

export const checkoutApi = {
  simulate: async (data: CheckoutSimulation) => {
    const response = await api.post("/checkout/simulate", data);
    return response.data;
  },
  confirm: async (token: string) => {
    const response = await api.post(`/checkout/confirm/${token}`);
    return response.data;
  },
  getOrders: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get("/checkout/orders", { params });
    return response.data;
  },
  getOrderById: async (id: string) => {
    const response = await api.get(`/checkout/orders/${id}`);
    return response.data;
  },
};

export const analyticsApi = {
  getDashboard: async () => {
    const response = await api.get("/analytics/dashboard");
    return response.data;
  },
  getDropAnalytics: async (dropId: string) => {
    const response = await api.get(`/analytics/drops/${dropId}`);
    return response.data;
  },
};

export const webhooksApi = {
  getAll: async () => {
    const response = await api.get("/webhooks");
    return response.data;
  },
  create: async (data: { url: string; events: string[] }) => {
    const response = await api.post("/webhooks", data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/webhooks/${id}`);
    return response.data;
  },
  getLogs: async (webhookId: string) => {
    const response = await api.get(`/webhooks/${webhookId}/logs`);
    return response.data;
  },
};

export const uploadApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
