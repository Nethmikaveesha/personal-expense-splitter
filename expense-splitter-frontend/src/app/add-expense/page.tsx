"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
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
    <DashboardLayout title="Add expense">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Log what you spent and who shares it.{" "}
          <Link href="/dashboard" className="font-medium text-emerald-600 hover:underline">
            Back to overview
          </Link>
        </p>
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <ExpenseForm
            defaultPaidByEmail={email}
            onSuccess={() => router.push("/dashboard")}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
