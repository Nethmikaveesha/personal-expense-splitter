"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/services/api";
import type { User } from "@/types";

function roleLabel(role: string | undefined) {
  if (role === "admin") return "Administrator";
  return "Customer";
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!api.getToken()) {
      router.replace("/login");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const me = await api.getMe();
      setUser(me);
      const token = api.getToken();
      if (token) api.setSession(token, me);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load profile.");
      setUser(api.getStoredUser());
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const initial = (user?.name || user?.email || "?").slice(0, 1).toUpperCase();

  return (
    <DashboardLayout title="Profile">
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Your account details from ExpenseMate.{" "}
          <Link href="/dashboard" className="font-medium text-emerald-600 hover:underline">
            Back to dashboard
          </Link>
        </p>

        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}

        {loading && !user ? (
          <p className="text-sm text-zinc-500">Loading profile…</p>
        ) : user ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="border-b border-zinc-100 bg-zinc-50/80 px-6 py-8 dark:border-zinc-800 dark:bg-zinc-900/80">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-2xl font-semibold text-white"
                  aria-hidden
                >
                  {initial}
                </div>
                <div className="min-w-0 text-center sm:text-left">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{user.name}</h2>
                  <p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-400">{user.email}</p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    {roleLabel(user.role)}
                  </p>
                </div>
              </div>
            </div>

            <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="grid gap-1 px-6 py-4 sm:grid-cols-[140px_1fr] sm:items-center">
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Full name</dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-100">{user.name}</dd>
              </div>
              <div className="grid gap-1 px-6 py-4 sm:grid-cols-[140px_1fr] sm:items-center">
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Email</dt>
                <dd className="break-all text-sm text-zinc-900 dark:text-zinc-100">{user.email}</dd>
              </div>
              <div className="grid gap-1 px-6 py-4 sm:grid-cols-[140px_1fr] sm:items-center">
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Account type</dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-100">{roleLabel(user.role)}</dd>
              </div>
              <div className="grid gap-1 px-6 py-4 sm:grid-cols-[140px_1fr] sm:items-center">
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">User ID</dt>
                <dd className="font-mono text-xs text-zinc-700 dark:text-zinc-300">{user.id}</dd>
              </div>
              {user.isFake ? (
                <div className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    Demo / test account
                  </span>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Profile details are read-only and come from your account on the server.
        </p>
      </div>
    </DashboardLayout>
  );
}
