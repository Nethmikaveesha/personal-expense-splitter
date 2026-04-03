"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { ExpenseList } from "@/components/ExpenseList";
import { api } from "@/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Expense } from "@/types";

export default function MyExpensesPage() {
  const router = useRouter();
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
      const list = await api.listMyExpenses();
      setExpenses(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load expenses.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const currentUserId = api.getStoredUser()?.id ?? null;

  return (
    <DashboardLayout title="My expenses">
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Expenses you created or participate in.{" "}
          <Link href="/dashboard" className="font-medium text-emerald-600 hover:underline">
            Back to dashboard
          </Link>
        </p>

        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}

        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">All expenses</h2>
          {loading ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : (
            <ExpenseList
              expenses={expenses}
              currentUserId={currentUserId}
              onEdit={(id) => router.push(`/edit-expense/${id}`)}
              onDelete={async (id) => {
                if (!confirm("Delete this expense?")) return;
                try {
                  await api.deleteExpense(id);
                  await load();
                } catch (err) {
                  alert(err instanceof Error ? err.message : "Delete failed.");
                }
              }}
            />
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
