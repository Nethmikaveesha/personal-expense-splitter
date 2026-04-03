"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-12">

        {/* TOP GRID */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">

          {/* BRAND */}
          <div>
            <h2 className="text-lg font-semibold text-emerald-600">
              ExpenseMate
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              A simple way to split bills, track shared expenses, and manage money with friends.
            </p>
          </div>

          {/* PRODUCT */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Product
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><Link href="/dashboard" className="hover:text-emerald-600">Dashboard</Link></li>
              <li><Link href="/add-expense" className="hover:text-emerald-600">Add Expense</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Reports</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Analytics</Link></li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Company
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><Link href="#" className="hover:text-emerald-600">About Us</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Careers</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Blog</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Contact</Link></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Support
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><Link href="#" className="hover:text-emerald-600">Help Center</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-emerald-600">FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-8 border-t border-zinc-200 dark:border-zinc-800" />

        {/* BOTTOM */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} ExpenseMate. All rights reserved.
          </p>

          <div className="flex gap-5 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="https://twitter.com/" target="_blank" className="hover:text-emerald-600">
              Twitter
            </Link>
            <Link href="https://facebook.com/" target="_blank" className="hover:text-emerald-600">
              Facebook
            </Link>
            <Link href="https://instagram.com/" target="_blank" className="hover:text-emerald-600">
              Instagram
            </Link>
            <Link href="https://linkedin.com/" target="_blank" className="hover:text-emerald-600">
              LinkedIn
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}