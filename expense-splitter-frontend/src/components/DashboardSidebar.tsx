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

type DashboardSidebarProps = { role: UserRole };

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Home" },
    { href: "/add-expense", label: "Add Expense" },
    { href: "/profile", label: "Profile" },
  ];

  if (role === "admin") {
    links.push({ href: "/admin/users", label: "Manage Users" });
  }

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-6">Menu</h2>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              pathname === link.href
                ? "bg-emerald-600 text-white"
                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}