"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/services/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await api.register({ name, email, password });
      api.setSession(token, user);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-emerald-50 to-white dark:from-zinc-900 dark:to-zinc-950">

      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">

        <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-white">
          Create account 🚀
        </h1>

        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Join <span className="text-emerald-600 font-medium">ExpenseMate</span> today
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">

          {/* NAME */}
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              minLength={6}
            />
          </div>

          {/* ERROR */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-emerald-600 py-2.5 text-white font-medium hover:bg-emerald-700 transition"
          >
            {loading ? "Creating..." : "Sign up"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-600 font-medium hover:underline">
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}