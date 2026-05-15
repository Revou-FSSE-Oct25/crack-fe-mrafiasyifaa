import { ApiError } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const t = localStorage.getItem("access_token");
  if (!t || t === "undefined" || t === "null") return null;
  return t;
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | string[]>;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, headers, ...rest } = options;

  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, v));
      } else {
        url.searchParams.set(key, value);
      }
    });
  }

  const token = getToken();
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url.toString(), {
    ...rest,
    headers: { ...defaultHeaders, ...headers },
  });

  if (!res.ok) {
    const body: ApiError = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    if (res.status === 401 && !endpoint.startsWith("/auth")) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth-storage");
      document.cookie = "access_token=; path=/; max-age=0";
      document.cookie = "user_role=; path=/; max-age=0";
      window.location.href = "/login";
      return undefined as T;
    }
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | string[]>) =>
    fetchApi<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, body?: unknown) =>
    fetchApi<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body?: unknown) =>
    fetchApi<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: "DELETE" }),
};
