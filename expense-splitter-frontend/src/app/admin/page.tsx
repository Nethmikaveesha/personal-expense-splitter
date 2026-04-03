"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ExpenseList } from "@/components/ExpenseList";
import { api } from "@/services/api";
import type { AdminStats, BalanceEntry, Expense, User } from "@/types";

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [balances, setBalances] = useState<BalanceEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = api.getToken();
    const u = api.getStoredUser();
    if (!token) {
      router.replace("/login");
      return;
    }
    if (u?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const [userList, expenseList, s, bal] = await Promise.all([
        api.adminListUsers(),
        api.adminListExpenses(),
        api.adminStats(),
        api.adminListUserBalances(),
      ]);
      setUsers(userList);
      setExpenses(expenseList);
      setStats(s);
      setBalances(bal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin API error.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const deleteFake = async (user: User) => {
    if (!user.isFake) return;
    if (!confirm(`Delete fake user ${user.email}?`)) return;
    setDeletingId(user.id);
    try {
      await api.adminDeleteUser(user.id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && users.length === 0 && !stats) {
    return (
      <DashboardLayout>
        <p className="text-center text-zinc-500">Loading admin…</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          <a
            onClick={() => router.push("/dashboard")}
            className="text-emerald-600 hover:underline cursor-pointer"
          >
            ← Dashboard
          </a>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {error}
        </div>
      )}

      {/* Admin stats cards */}
      {stats && (
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Users</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{stats.totalUsers}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Expenses</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{stats.totalExpenses}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Total recorded</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatMoney(stats.totalAmountRecorded)}
            </p>
          </div>
        </section>
      )}

      {/* User balances */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">User balances</h2>
        {balances.length === 0 ? (
          <p className="text-sm text-zinc-500">No balances yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/80">
                <tr>
                  <th className="px-4 py-2 font-medium">User</th>
                  <th className="px-4 py-2 font-medium">Net balance</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((b) => (
                  <tr key={b.userId} className="border-b border-zinc-100 dark:border-zinc-800/80">
                    <td className="px-4 py-2">
                      {b.name} <span className="text-zinc-400">({b.email})</span>
                    </td>
                    <td
                      className={
                        b.netBalance >= 0
                          ? "px-4 py-2 font-medium text-emerald-700 dark:text-emerald-300"
                          : "px-4 py-2 font-medium text-rose-700 dark:text-rose-300"
                      }
                    >
                      {b.netBalance >= 0 ? "+" : ""}
                      {formatMoney(b.netBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* All users */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">All users</h2>
        {users.length === 0 ? (
          <p className="text-sm text-zinc-500">No users loaded.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/80">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Role</th>
                  <th className="px-4 py-2 font-medium">Fake</th>
                  <th className="px-4 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800/80">
                    <td className="px-4 py-2">{u.name}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">{u.role ?? "user"}</td>
                    <td className="px-4 py-2">{u.isFake ? "yes" : "no"}</td>
                    <td className="px-4 py-2 text-right">
                      {u.isFake && (
                        <button
                          type="button"
                          disabled={deletingId === u.id}
                          onClick={() => void deleteFake(u)}
                          className="text-sm text-rose-600 hover:underline disabled:opacity-50"
                        >
                          {deletingId === u.id ? "Deleting…" : "Delete"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* All expenses */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">All expenses</h2>
        <ExpenseList expenses={expenses} emptyMessage="No expenses in the system." />
      </section>
    </DashboardLayout>
  );
}