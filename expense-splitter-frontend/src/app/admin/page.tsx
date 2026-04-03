"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
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

const sections = [
  { id: "admin-overview", label: "Overview" },
  { id: "admin-stats", label: "Stats" },
  { id: "admin-balances", label: "Balances" },
  { id: "admin-users", label: "Users" },
  { id: "admin-expenses", label: "Expenses" },
] as const;

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [balances, setBalances] = useState<BalanceEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [fakeName, setFakeName] = useState("Demo user");
  const [fakeEmail, setFakeEmail] = useState("fake.user@example.com");
  const [fakePassword, setFakePassword] = useState("");
  const [creatingFake, setCreatingFake] = useState(false);
  const [fakeFormError, setFakeFormError] = useState<string | null>(null);

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
      setUpdatedAt(new Date());
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
    if (!confirm(`Delete fake user ${user.email}? This cannot be undone.`)) return;
    setDeletingUserId(user.id);
    try {
      await api.adminDeleteUser(user.id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingUserId(null);
    }
  };

  const createFakeUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFakeFormError(null);
    if (!fakePassword.trim()) {
      setFakeFormError("Set a password for the fake user.");
      return;
    }
    setCreatingFake(true);
    try {
      await api.adminCreateFakeUser({
        name: fakeName.trim(),
        email: fakeEmail.trim(),
        password: fakePassword,
      });
      setFakePassword("");
      await load();
    } catch (err) {
      setFakeFormError(err instanceof Error ? err.message : "Could not create user.");
    } finally {
      setCreatingFake(false);
    }
  };

  const deleteExpenseAdmin = async (expenseId: string) => {
    if (!confirm("Delete this expense for all users? Splits will be removed. This cannot be undone.")) {
      return;
    }
    setDeletingExpenseId(expenseId);
    try {
      await api.adminDeleteExpense(expenseId);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingExpenseId(null);
    }
  };

  if (loading && users.length === 0 && !stats) {
    return (
      <DashboardLayout title="Admin">
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="text-sm text-zinc-500">Loading admin console…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin">
      <div className="mx-auto max-w-6xl space-y-10 pb-8">
        {/* Toolbar */}
        <div
          id="admin-overview"
          className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">Administrator console</p>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              View platform-wide stats, user balances, every account and expense, delete{" "}
              <strong className="text-zinc-800 dark:text-zinc-200">fake</strong> users, and remove any
              expense (moderation).
            </p>
            {updatedAt && (
              <p className="mt-2 text-xs text-zinc-500">
                Data loaded {updatedAt.toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              {loading ? "Refreshing…" : "Refresh data"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Customer dashboard
            </button>
          </div>
        </div>

        {/* Jump nav */}
        <nav
          className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800"
          aria-label="Admin sections"
        >
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {s.label}
            </a>
          ))}
        </nav>

        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}

        {/* Stats */}
        <section id="admin-stats" className="scroll-mt-24">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">Platform stats</h2>
          {stats && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Total users</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-white">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Total expenses
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-white">
                  {stats.totalExpenses}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Sum of all expense amounts
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatMoney(stats.totalAmountRecorded)}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Balances */}
        <section id="admin-balances" className="scroll-mt-24">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            User balances (system-wide)
          </h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Net position per user across every shared expense (same semantics as customer “balance,”
            aggregated for the whole app).
          </p>
          {balances.length === 0 ? (
            <p className="text-sm text-zinc-500">No non-zero balances.</p>
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

        {/* Users */}
        <section id="admin-users" className="scroll-mt-24">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">All users</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Delete is only available for accounts marked as fake (test data). Create a fake user below
            — they can log in on the customer login like any other user.
          </p>

          <form
            onSubmit={(e) => void createFakeUser(e)}
            className="mb-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Add fake user</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Stored with <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">is_fake = true</code> so
              you can remove them from this table later.
            </p>
            {fakeFormError && (
              <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{fakeFormError}</p>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Name</span>
                <input
                  value={fakeName}
                  onChange={(e) => setFakeName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="text-zinc-600 dark:text-zinc-400">Email</span>
                <input
                  type="email"
                  value={fakeEmail}
                  onChange={(e) => setFakeEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
                />
              </label>
              <label className="block text-sm sm:col-span-3">
                <span className="text-zinc-600 dark:text-zinc-400">Password</span>
                <input
                  type="password"
                  value={fakePassword}
                  onChange={(e) => setFakePassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Choose a password"
                  className="mt-1 w-full max-w-md rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={creatingFake}
              className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {creatingFake ? "Creating…" : "Create fake user"}
            </button>
          </form>
          {users.length === 0 ? (
            <p className="text-sm text-zinc-500">No users.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/80">
                  <tr>
                    <th className="px-4 py-2 font-medium">User ID</th>
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
                      <td className="max-w-[120px] truncate px-4 py-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {u.id}
                      </td>
                      <td className="px-4 py-2">{u.name}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">{u.role ?? "user"}</td>
                      <td className="px-4 py-2">{u.isFake ? "yes" : "no"}</td>
                      <td className="px-4 py-2 text-right">
                        {u.isFake && (
                          <button
                            type="button"
                            disabled={deletingUserId === u.id}
                            onClick={() => void deleteFake(u)}
                            className="text-sm text-rose-600 hover:underline disabled:opacity-50"
                          >
                            {deletingUserId === u.id ? "Deleting…" : "Delete fake user"}
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

        {/* Expenses */}
        <section id="admin-expenses" className="scroll-mt-24">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">All expenses</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Full history with splits. Use admin delete to remove a bad or abusive entry (customers
            cannot delete others’ expenses).
          </p>
          <ExpenseList
            expenses={expenses}
            emptyMessage="No expenses in the system."
            onAdminDelete={(id) => void deleteExpenseAdmin(id)}
            adminDeleteDisabled={deletingExpenseId !== null}
          />
        </section>
      </div>
    </DashboardLayout>
  );
}
