"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

type ExpenseFormProps = {
  defaultPaidByEmail?: string;
  defaultDescription?: string;
  defaultAmount?: number;
  defaultParticipantsRaw?: string;
  mode?: "create" | "update";
  expenseId?: string;
  onSuccess?: () => void;
};

export function ExpenseForm({
  defaultPaidByEmail = "",
  defaultDescription = "",
  defaultAmount,
  defaultParticipantsRaw = "",
  mode = "create",
  expenseId,
  onSuccess,
}: ExpenseFormProps) {
  const [description, setDescription] = useState(defaultDescription);
  const [amount, setAmount] = useState(
    typeof defaultAmount === "number" ? String(defaultAmount) : "",
  );
  const [paidByEmail, setPaidByEmail] = useState(defaultPaidByEmail);
  const [participantsRaw, setParticipantsRaw] = useState(defaultParticipantsRaw);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultPaidByEmail) setPaidByEmail(defaultPaidByEmail);
  }, [defaultPaidByEmail]);

  useEffect(() => {
    if (defaultDescription) setDescription(defaultDescription);
  }, [defaultDescription]);

  useEffect(() => {
    if (typeof defaultAmount === "number") setAmount(String(defaultAmount));
    if (defaultAmount === undefined) setAmount("");
  }, [defaultAmount]);

  useEffect(() => {
    if (defaultParticipantsRaw) setParticipantsRaw(defaultParticipantsRaw);
  }, [defaultParticipantsRaw]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const n = parseFloat(amount);
    if (!description.trim() || Number.isNaN(n) || n <= 0) {
      setError("Enter a description and a valid amount.");
      return;
    }
    const emails = participantsRaw
      .split(/[\n,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (emails.length === 0) {
      setError("Add at least one person to split with (include the payer’s email).");
      return;
    }
    if (!paidByEmail.trim()) {
      setError("Who paid?");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        description: description.trim(),
        amount: n,
        paidByEmail: paidByEmail.trim().toLowerCase(),
        participantEmails: emails,
      };

      if (mode === "update") {
        if (!expenseId) throw new Error("Missing expenseId for update.");
        await api.updateExpense(expenseId, payload);
      } else {
        await api.createExpense(payload);
        setDescription("");
        setAmount("");
        setParticipantsRaw("");
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          What was it for?
        </label>
        <input
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Dinner, rent, road trip…"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Amount
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Paid by (email)
        </label>
        <input
          type="email"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          value={paidByEmail}
          onChange={(e) => setPaidByEmail(e.target.value)}
          placeholder="who@paid.com"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Add participants (emails)
        </label>
        <textarea
          className="min-h-[100px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          value={participantsRaw}
          onChange={(e) => setParticipantsRaw(e.target.value)}
          placeholder="One email per line, or comma-separated. Include everyone splitting the bill (including the payer)."
        />
        <p className="mt-1 text-xs text-zinc-500">
          The total is split equally across these people. Your backend decides the exact math.
        </p>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Saving…" : mode === "update" ? "Update expense" : "Save expense"}
      </button>
    </form>
  );
}
