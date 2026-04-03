"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { api } from "@/services/api";

export default function AddExpensePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!api.getToken()) {
      router.replace("/login");
      return;
    }
    const u = api.getStoredUser();
    if (u?.email) setEmail(u.email);
  }, [router]);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Add expense</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Log what you spent and who shares it.{" "}
        <Link href="/dashboard" className="text-emerald-600 hover:underline">
          Back to dashboard
        </Link>
      </p>
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <ExpenseForm
          defaultPaidByEmail={email}
          onSuccess={() => router.push("/dashboard")}
        />
      </div>
    </div>
  );
}
