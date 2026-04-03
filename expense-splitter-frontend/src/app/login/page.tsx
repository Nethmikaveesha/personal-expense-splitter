"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/services/api";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await api.login({ identifier, password });
      api.setSession(token, user);
      window.location.href = user.role === "admin" ? "/admin" : "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-emerald-50 to-white dark:from-zinc-900 dark:to-zinc-950">
      
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">

        <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-white">
          Welcome back 👋
        </h1>

        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Log in to continue using <span className="text-emerald-600 font-medium">ExpenseMate</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">

          {/* IDENTIFIER */}
          <div>
            <label className="text-sm font-medium">Email or username</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-emerald-600 py-2.5 text-white font-medium hover:bg-emerald-700 transition"
          >
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        {/* FOOTER LINKS */}
        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don’t have an account?{" "}
          <Link href="/register" className="text-emerald-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}