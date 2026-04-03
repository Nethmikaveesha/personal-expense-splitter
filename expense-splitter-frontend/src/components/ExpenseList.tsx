import type { Expense } from "@/types";

type ExpenseListProps = {
  expenses: Expense[];
  emptyMessage?: string;
  currentUserId?: string | null;
  onEdit?: (expenseId: string) => void;
  onDelete?: (expenseId: string) => void;
};

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export function ExpenseList({
  expenses,
  emptyMessage = "No expenses yet.",
  currentUserId,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {expenses.map((ex) => (
        <li
          key={ex.id}
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{ex.description}</p>
              <p className="text-xs text-zinc-500">
                Paid by {ex.paidByName ?? ex.paidByEmail ?? ex.paidByUserId}
                {ex.createdAt && ` · ${new Date(ex.createdAt).toLocaleString()}`}
              </p>
            </div>
            <p className="text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
              {formatMoney(ex.amount)}
            </p>
          </div>

          {currentUserId && ex.paidByUserId === currentUserId && (onEdit || onDelete) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(ex.id)}
                  className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(ex.id)}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  Delete
                </button>
              )}
            </div>
          )}

          {ex.splits?.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-zinc-100 pt-3 text-sm dark:border-zinc-800">
              {ex.splits.map((s) => (
                <li key={s.userId} className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>{s.userName ?? s.email ?? s.userId}</span>
                  <span className="tabular-nums">{formatMoney(s.share)}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
