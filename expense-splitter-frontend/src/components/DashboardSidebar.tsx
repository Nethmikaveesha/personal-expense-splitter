// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import type { UserRole } from "@/types";
// import { api } from "@/services/api";

// type DashboardSidebarProps = {
//   role: UserRole;
// };

// function IconDashboard({ className }: { className?: string }) {
//   return (
//     <svg
//       className={className}
//       width="18"
//       height="18"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M3 9l9-6 9 6" />
//       <path d="M9 22V12h6v10" />
//     </svg>
//   );
// }

// function IconPlus({ className }: { className?: string }) {
//   return (
//     <svg
//       className={className}
//       width="18"
//       height="18"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M12 5v14" />
//       <path d="M5 12h14" />
//     </svg>
//   );
// }

// function IconShield({ className }: { className?: string }) {
//   return (
//     <svg
//       className={className}
//       width="18"
//       height="18"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//     </svg>
//   );
// }

// export function DashboardSidebar({ role }: DashboardSidebarProps) {
//   const pathname = usePathname();

//   const showAdmin = role === "admin";

//   const activeDashboard = pathname === "/dashboard";
//   const activeAddExpense = pathname === "/add-expense";
//   const activeAdmin = pathname === "/admin";

//   const logout = () => {
//     api.clearSession();
//     window.location.href = "/login";
//   };

//   return (
//     <aside className="w-72 shrink-0">
//       <div className="sticky top-0 h-[calc(100vh-4rem)] rounded-2xl bg-[#0B5BD3] p-6 text-white shadow-sm">
//         <div className="flex items-center gap-2">
//           <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
//             <span className="text-sm font-bold tracking-tight">aM</span>
//           </div>
//           <div className="leading-tight">
//             <div className="text-lg font-semibold">ExpenseMate</div>
//             <div className="text-xs text-white/70">{showAdmin ? "Admin" : "Customer"}</div>
//           </div>
//         </div>

//         <nav className="mt-6 flex flex-col gap-3">
//           <Link
//             href="/dashboard"
//             className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors ${
//               activeDashboard
//                 ? "bg-white text-zinc-900"
//                 : "bg-transparent text-white/90 hover:bg-white/10"
//             }`}
//           >
//             <IconDashboard className="text-inherit" />
//             <span>Dashboard</span>
//           </Link>

//           {!showAdmin && (
//             <Link
//               href="/add-expense"
//               className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors ${
//                 activeAddExpense
//                   ? "bg-white text-zinc-900"
//                   : "bg-transparent text-white/90 hover:bg-white/10"
//               }`}
//             >
//               <IconPlus className="text-inherit" />
//               <span>Add expense</span>
//             </Link>
//           )}

//           {showAdmin && (
//             <Link
//               href="/admin"
//               className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors ${
//                 activeAdmin
//                   ? "bg-white text-zinc-900"
//                   : "bg-transparent text-white/90 hover:bg-white/10"
//               }`}
//             >
//               <IconShield className="text-inherit" />
//               <span>Admin</span>
//             </Link>
//           )}
//         </nav>

//         <div className="mt-6 border-t border-white/15 pt-4">
//           <button
//             type="button"
//             onClick={logout}
//             className="flex w-full items-center justify-center rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/15"
//           >
//             Log out
//           </button>
//         </div>
//       </div>
//     </aside>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/types";
import { api } from "@/services/api";

type DashboardSidebarProps = { role: UserRole };

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const user = api.getStoredUser();

  const links =
    role === "admin"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/admin", label: "Manage Users" },
          { href: "/profile", label: "Profile" },
        ]
      : [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/add-expense", label: "Add Expense" },
          { href: "/balances", label: "Who owes what" },
          { href: "/my-expenses", label: "My expenses" },
          { href: "/profile", label: "Profile" },
        ];

  const logout = () => {
    api.clearSession();
    window.location.href = "/login";
  };

  return (
    <aside className="flex w-64 min-h-screen flex-col border-r border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
      <h2 className="mb-6 text-xl font-bold">Menu</h2>
      <nav className="flex flex-1 flex-col gap-2">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href === "/my-expenses" && pathname.startsWith("/edit-expense"));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-zinc-200 pt-4 dark:border-zinc-700">
        {user?.name && (
          <p className="mb-3 truncate px-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">{user.name}</p>
        )}
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}