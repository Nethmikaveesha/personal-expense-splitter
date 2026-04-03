"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { BalanceDonut } from "@/components/BalanceDonut";
import { api } from "@/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { BalanceSummary, Expense } from "@/types";

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

export default function DashboardPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<BalanceSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
      const [bal, ex] = await Promise.all([api.getBalance(), api.listMyExpenses()]);
      setBalance(bal);
      setExpenses(ex);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const user = api.getStoredUser();

  const { owedToYou, youOwe, gross, pctOwed, pctOwe } = useMemo(() => {
    const entries = balance?.entries ?? [];
    const owed = entries.reduce((s, e) => s + Math.max(0, e.netBalance), 0);
    const owe = entries.reduce((s, e) => s + Math.max(0, -e.netBalance), 0);
    const g = owed + owe;
    return {
      owedToYou: owed,
      youOwe: owe,
      gross: g,
      pctOwed: g > 0 ? Math.round((owed / g) * 1000) / 10 : 0,
      pctOwe: g > 0 ? Math.round((owe / g) * 1000) / 10 : 0,
    };
  }, [balance]);

  const expenseStats = useMemo(() => {
    const count = expenses.length;
    const totalBills = expenses.reduce((s, e) => s + e.amount, 0);
    return { count, totalBills };
  }, [expenses]);

  if (loading && !balance) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="text-sm text-zinc-500">Loading your dashboard…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="mx-auto max-w-5xl space-y-8 pb-8">
        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}

        <header className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:from-emerald-950/30 dark:via-zinc-900/80 dark:to-zinc-950">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Welcome back</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {user?.name ?? "there"}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            Here’s a snapshot of your shared expenses: net balance, how much is owed in each direction,
            and activity across your groups.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Net balance
            </p>
            <p
              className={`mt-2 text-2xl font-bold tabular-nums ${
                (balance?.yourTotalBalance ?? 0) >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {balance ? formatMoney(balance.yourTotalBalance) : "—"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Overall position across everyone</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Others owe you
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatMoney(owedToYou)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Sum of positive balances</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              You owe others
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
              {formatMoney(youOwe)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Sum of what you still owe</p>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
          <div className="flex flex-col items-center justify-center lg:items-start">
            <h3 className="mb-4 w-full text-center text-sm font-semibold text-zinc-900 lg:text-left dark:text-white">
              Balance mix
            </h3>
            <p className="mb-6 max-w-sm text-center text-sm text-zinc-600 lg:text-left dark:text-zinc-400">
              Chart shows what share of outstanding amounts between you and others is money owed{" "}
              <strong className="text-zinc-800 dark:text-zinc-200">to you</strong> versus money{" "}
              <strong className="text-zinc-800 dark:text-zinc-200">you owe</strong> (percentages add
              to 100%).
            </p>
            <div className="flex justify-center lg:justify-start">
              <BalanceDonut owedToYou={owedToYou} youOwe={youOwe} />
            </div>
          </div>

          <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Percentages</h3>
            {gross > 0 ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-300">Owed to you</span>
                    <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {pctOwed}% · {formatMoney(owedToYou)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all dark:bg-emerald-500"
                      style={{ width: `${pctOwed}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-300">You owe</span>
                    <span className="font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                      {pctOwe}% · {formatMoney(youOwe)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-all dark:bg-rose-500"
                      style={{ width: `${pctOwe}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No two-way balance yet—once you split bills with others, this section will show how
                much of the total is owed to you vs by you.
              </p>
            )}

            <div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Activity
              </h4>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">Expenses tracked</dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 dark:text-white">
                    {expenseStats.count}
                  </dd>
                </div>
                <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">Total bill volume</dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 dark:text-white">
                    {formatMoney(expenseStats.totalBills)}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                Bill volume is the sum of full expense amounts you’re part of—not only your share.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900/30">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">This page includes:</span>{" "}
            net balance, directional totals (owed to you / you owe), a balance mix chart with
            matching percentages, and high-level expense activity. Go deeper via{" "}
            <Link href="/add-expense" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
              Add expense
            </Link>
            ,{" "}
            <Link href="/balances" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
              Who owes what
            </Link>
            , or{" "}
            <Link href="/my-expenses" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
              My expenses
            </Link>
            .
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}
