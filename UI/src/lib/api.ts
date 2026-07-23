const API_BASE = import.meta.env.VITE_API_URL ?? "";

const ADMIN_TOKEN_KEY = "tprime_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, auth = false): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (auth) {
    const token = getAdminToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // response had no JSON body
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  createBooking: (data: unknown) =>
    request("/api/bookings", { method: "POST", body: JSON.stringify(data) }),
  createContact: (data: unknown) =>
    request("/api/contacts", { method: "POST", body: JSON.stringify(data) }),
  adminLogin: (email: string, password: string) =>
    request<{ access_token: string; token_type: string }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  listBookings: () => request("/api/admin/bookings", {}, true),
  updateBookingStatus: (id: number, status: string) =>
    request(`/api/admin/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, true),
  deleteBooking: (id: number) => request(`/api/admin/bookings/${id}`, { method: "DELETE" }, true),
  listContacts: () => request("/api/admin/contacts", {}, true),
  updateContactStatus: (id: number, status: string) =>
    request(`/api/admin/contacts/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, true),
  deleteContact: (id: number) => request(`/api/admin/contacts/${id}`, { method: "DELETE" }, true),
};
