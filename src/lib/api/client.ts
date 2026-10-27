import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { endpoints } from "./endpoints";
import { normalizeError } from "./errors";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const TOKEN_KEY = "access_token";
const TOKEN_CHANGE_EVENT = "gu-lms:token-change";

function notifyTokenChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TOKEN_CHANGE_EVENT));
  }
}

export const TOKEN_EVENT = TOKEN_CHANGE_EVENT;
const REFRESH_KEY = "refresh_token";

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ──────────────────────────────────────────────────────────────────────
// Request interceptor — attach Bearer token
// ──────────────────────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ──────────────────────────────────────────────────────────────────────
// Response interceptor — refresh on 401
// ──────────────────────────────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as
      (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (
      !original ||
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes(endpoints.auth.refresh) ||
      original.url?.includes(endpoints.auth.login)
    ) {
      return Promise.reject(normalizeError(error));
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) return reject(normalizeError(error));
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshToken =
        typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;
      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post(`${BASE_URL}${endpoints.auth.refresh}`, {
        refresh: refreshToken,
      });

      const newAccess = data?.data?.access;
      const newRefresh = data?.data?.refresh;
      if (!newAccess) throw new Error("Refresh failed");

      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, newAccess);
        if (newRefresh) localStorage.setItem(REFRESH_KEY, newRefresh);
        notifyTokenChange(); // ← add
      }

      refreshQueue.forEach((cb) => cb(newAccess));
      refreshQueue = [];

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return apiClient(original);
    } catch (refreshErr) {
      refreshQueue.forEach((cb) => cb(null));
      refreshQueue = [];

      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        notifyTokenChange(); // ← add
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
      return Promise.reject(normalizeError(refreshErr));
    } finally {
      isRefreshing = false;
    }
  }
);

// ──────────────────────────────────────────────────────────────────────
// Typed helpers
// ──────────────────────────────────────────────────────────────────────
export async function get<T>(url: string, config?: AxiosRequestConfig) {
  const { data } = await apiClient.get<T>(url, config);
  return data;
}

export async function post<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
  const { data } = await apiClient.post<T>(url, body, config);
  return data;
}

export async function patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
  const { data } = await apiClient.patch<T>(url, body, config);
  return data;
}

export async function put<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
  const { data } = await apiClient.put<T>(url, body, config);
  return data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig) {
  const { data } = await apiClient.delete<T>(url, config);
  return data;
}

// Session helpers used by the auth store
export function hasTokens(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function storeTokens(access: string, refresh?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  notifyTokenChange();
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  notifyTokenChange();
}
