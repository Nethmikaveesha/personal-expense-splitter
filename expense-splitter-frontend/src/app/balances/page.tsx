"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { BalanceSummary } from "@/types";

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

export default function BalancesPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<BalanceSummary | null>(null);
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
      const bal = await api.getBalance();
      setBalance(bal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load balances.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DashboardLayout title="Who owes what">
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Net amounts with each person you split expenses with.{" "}
          <Link href="/dashboard" className="font-medium text-emerald-600 hover:underline">
            Back to dashboard
          </Link>
        </p>

        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Your total balance</h2>
          <p className="mt-2 text-3xl font-semibold text-emerald-700 dark:text-emerald-400">
            {loading ? "—" : balance ? formatMoney(balance.yourTotalBalance) : "—"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Positive = others owe you, negative = you owe others
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">By person</h2>
          {loading ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : !balance || balance.entries.length === 0 ? (
            <p className="text-sm text-zinc-500">No balance data yet—add an expense to see splits.</p>
          ) : (
            <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50">
              {balance.entries.map((e) => (
                <li key={e.userId} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>
                    {e.name} <span className="text-zinc-400">({e.email})</span>
                  </span>
                  <span
                    className={
                      e.netBalance >= 0 ? "font-medium text-emerald-600" : "font-medium text-rose-600"
                    }
                  >
                    {e.netBalance >= 0 ? "+" : ""}
                    {formatMoney(e.netBalance)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
