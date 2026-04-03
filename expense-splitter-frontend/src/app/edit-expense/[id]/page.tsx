"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { ExpenseForm } from "@/components/ExpenseForm";
import { api } from "@/services/api";
import type { Expense } from "@/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
        const found = list.find((e) => String(e.id) === String(id)) ?? null;
        if (!found) {
          setError("Expense not found (or not editable).");
          return;
        }
        const currentUserId = api.getStoredUser()?.id ?? null;
        if (!currentUserId || String(found.paidByUserId) !== String(currentUserId)) {
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
    return (
      <DashboardLayout title="Edit expense">
        <p className="text-center text-zinc-500">Loading…</p>
      </DashboardLayout>
    );
  }

  if (error || !expense) {
    return (
      <DashboardLayout title="Edit expense">
        <div className="mx-auto max-w-2xl space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/my-expenses" className="font-medium text-emerald-600 hover:underline">
              ← Back to my expenses
            </Link>
            {" · "}
            <Link href="/dashboard" className="font-medium text-emerald-600 hover:underline">
              Dashboard
            </Link>
          </p>
          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </p>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit expense">
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Update this expense or go back to{" "}
          <Link href="/my-expenses" className="font-medium text-emerald-600 hover:underline">
            My expenses
          </Link>{" "}
          or the{" "}
          <Link href="/dashboard" className="font-medium text-emerald-600 hover:underline">
            dashboard
          </Link>
          .
        </p>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <ExpenseForm
            mode="update"
            expenseId={expense.id}
            defaultDescription={expense.description}
            defaultAmount={expense.amount}
            defaultPaidByEmail={initialPaidByEmail}
            defaultParticipantsRaw={initialParticipantsRaw}
            onSuccess={() => router.push("/my-expenses")}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
