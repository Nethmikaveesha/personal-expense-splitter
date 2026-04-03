import type {
  AdminStats,
  AuthResponse,
  BalanceSummary,
  Expense,
  BalanceEntry,
  User,
} from "@/types";

function clientApiBase(): string {
  if (typeof window === "undefined") return "";
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (raw && (raw.startsWith("http://") || raw.startsWith("https://"))) {
    return raw.replace(/\/$/, "");
  }
  // Local dev: same-origin `/api/*` → Next.js rewrites to Express (see next.config.ts)
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "";
  }
  return "http://127.0.0.1:5000";
}

const TOKEN_KEY = "expensemate_token";
const USER_KEY = "expensemate_user";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const { skipAuth, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);
  if (!headers.has("Content-Type") && rest.body && typeof rest.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token && !skipAuth) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const base = clientApiBase();
  const res = await fetch(`${base}${path}`, {
    ...rest,
    headers,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    const t = text.replace(/^\uFEFF/, "").trim();
    const ctype = res.headers.get("content-type") ?? "";
    const looksHtml =
      ctype.includes("text/html") ||
      t.startsWith("<") ||
      t.slice(0, 20).toLowerCase().includes("<!doctype");
    if (looksHtml) {
      throw new Error(
        "API returned a web page instead of JSON. Start the backend (npm run dev in expense-splitter-backend) and restart Next.js after changing .env.",
      );
    }
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      throw new Error(`Invalid response from API (${res.status}): ${t.slice(0, 120)}`);
    }
  }

  if (!res.ok) {
    const msg =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

export const api = {
  getToken,

  getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  setSession(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async register(body: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> {
    return request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    });
  },

  /** Customers use their email; admin uses username `admin` (see backend env). */
  async login(body: { identifier: string; password: string }): Promise<AuthResponse> {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    });
  },

  async getMe(): Promise<User> {
    return request<User>("/api/auth/me", { method: "GET" });
  },

  async createExpense(body: {
    description: string;
    amount: number;
    paidByEmail: string;
    participantEmails: string[];
  }): Promise<Expense> {
    return request<Expense>("/api/expenses", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateExpense(id: string, body: {
    description: string;
    amount: number;
    paidByEmail: string;
    participantEmails: string[];
  }): Promise<Expense> {
    return request<Expense>(`/api/expenses/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async deleteExpense(id: string): Promise<void> {
    await request(`/api/expenses/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  async listMyExpenses(): Promise<Expense[]> {
    return request<Expense[]>("/api/expenses", { method: "GET" });
  },

  async getBalance(): Promise<BalanceSummary> {
    return request<BalanceSummary>("/api/balance", { method: "GET" });
  },

  async adminListUsers(): Promise<User[]> {
    return request<User[]>("/api/admin/users", { method: "GET" });
  },

  async adminCreateFakeUser(body: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    return request<User>("/api/admin/fake-user", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async adminListExpenses(): Promise<Expense[]> {
    return request<Expense[]>("/api/admin/expenses", { method: "GET" });
  },

  async adminDeleteUser(userId: string): Promise<void> {
    await request(`/api/admin/users/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
  },

  async adminStats(): Promise<AdminStats> {
    return request<AdminStats>("/api/admin/stats", { method: "GET" });
  },

  async adminListUserBalances(): Promise<BalanceEntry[]> {
    return request<BalanceEntry[]>("/api/admin/balances", { method: "GET" });
  },

  async adminDeleteExpense(expenseId: string): Promise<void> {
    await request(`/api/admin/expenses/${encodeURIComponent(expenseId)}`, {
      method: "DELETE",
    });
  },
};
