"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { User } from "@/types";

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = api.getStoredUser();
    const token = api.getToken();

    if (!token) {
      setUser(null);
      return;
    }

    setUser(stored);
    api
      .getMe()
      .then(setUser)
      .catch(() => setUser(api.getStoredUser()));
  }, [pathname]);

  const logout = () => {
    api.clearSession();
    setUser(null);
    window.location.href = "/login";
  };

  const isAuthed = !!user;
  const logoutInSidebar =
    pathname === "/dashboard" || pathname === "/admin" || pathname.startsWith("/admin/");

  // reusable style
  const navLink = (path: string) =>
    `relative transition ${
      pathname === path
        ? "text-emerald-600 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-emerald-600"
        : "text-zinc-600 hover:text-emerald-600 dark:text-zinc-300"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/70 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">

        {/* LOGO */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-emerald-600"
        >
          ExpenseMate
        </Link>

        {/* NAV LINKS */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">

          <Link href="/" className={navLink("/")}>
            Home
          </Link>

          <Link href="/features" className={navLink("/features")}>
            Features
          </Link>

          <Link href="/pricing" className={navLink("/pricing")}>
            Pricing
          </Link>

          <Link href="/about" className={navLink("/about")}>
            About
          </Link>

          {isAuthed && (
            <>
              <Link href="/dashboard" className={navLink("/dashboard")}>
                Dashboard
              </Link>

              <Link href="/add-expense" className={navLink("/add-expense")}>
                Add Expense
              </Link>

              {user?.role === "admin" && (
                <Link href="/admin" className={navLink("/admin")}>
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          {!isAuthed ? (
            <>
              <Link
                href="/login"
                className="text-sm text-zinc-600 hover:text-emerald-600 dark:text-zinc-300"
              >
                Log in
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white shadow hover:bg-emerald-700"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              {!logoutInSidebar && (
                <>
                  <span className="hidden sm:block text-sm text-zinc-500">{user?.name}</span>

                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Log out
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}