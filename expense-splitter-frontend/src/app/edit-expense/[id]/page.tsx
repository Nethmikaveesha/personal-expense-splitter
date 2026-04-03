"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ExpenseForm } from "@/components/ExpenseForm";
import { api } from "@/services/api";
import type { Expense } from "@/types";

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = useMemo(() => {
    const raw = params?.id;
    return typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  }, [params]);

  const [expense, setExpense] = useState<Expense | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    async function load() {
      setError(null);
      setLoading(true);
      try {
        const list = await api.listMyExpenses();
        const found = list.find((e) => e.id === id) ?? null;
        if (!found) {
          setError("Expense not found (or not editable).");
          return;
        }
        const currentUserId = api.getStoredUser()?.id ?? null;
        if (!currentUserId || found.paidByUserId !== currentUserId) {
          setError("You can only edit expenses you paid for.");
          return;
        }
        setExpense(found);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load expense.");
      } finally {
        setLoading(false);
      }
    }

    if (id) void load();
  }, [id, router]);

  const initialPaidByEmail = expense?.paidByEmail ?? "";
  const initialParticipantsRaw = useMemo(() => {
    if (!expense?.splits) return "";
    const emails = expense.splits
      .map((s) => s.email)
      .filter((x): x is string => typeof x === "string" && x.length > 0);
    return [...new Set(emails)].join("\n");
  }, [expense]);

  if (loading) {
    return <p className="text-center text-zinc-500">Loading…</p>;
  }

  if (error || !expense) {
    return (
      <div className="mx-auto max-w-xl">
        <p className="text-sm text-zinc-500">
          <button type="button" onClick={() => router.push("/dashboard")} className="font-medium text-emerald-600 hover:underline">
            ← Back
          </button>
        </p>
        {error && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Edit expense</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="font-medium text-emerald-600 hover:underline"
        >
          ← Back to dashboard
        </button>
      </p>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <ExpenseForm
          mode="update"
          expenseId={expense.id}
          defaultDescription={expense.description}
          defaultAmount={expense.amount}
          defaultPaidByEmail={initialPaidByEmail}
          defaultParticipantsRaw={initialParticipantsRaw}
          onSuccess={() => router.push("/dashboard")}
        />
      </div>
    </div>
  );
}

