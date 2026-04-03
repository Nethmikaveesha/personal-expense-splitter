// "use client";

// import { ReactNode } from "react";
// import { DashboardSidebar } from "./DashboardSidebar";
// import { api } from "@/services/api";

// type DashboardLayoutProps = {
//   children: ReactNode;
// };

// export default function DashboardLayout({ children }: DashboardLayoutProps) {
//   const user = api.getStoredUser();
//   const role = user?.role ?? "user";

//   return (
//     <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white">
//       {/* Sidebar */}
//       <DashboardSidebar role={role} />

//       {/* Main content */}
//       <main className="flex-1 p-6 lg:pl-0">
//         {/* Top header (optional) */}
//         <header className="mb-6">
//           <div className="flex items-center justify-between">
//             <h1 className="text-3xl font-bold">{role === "admin" ? "Admin Dashboard" : "Dashboard"}</h1>
//           </div>
//         </header>

//         {/* Page content */}
//         <div className="space-y-10">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// }
"use client";

import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { api } from "@/services/api";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = api.getStoredUser();
  const role = user?.role ?? "user";

  return (
    <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white">
      <DashboardSidebar role={role} />
      <main className="flex-1 p-6 lg:pl-0">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">{role === "admin" ? "Admin Dashboard" : "Dashboard"}</h1>
        </header>
        <div className="space-y-10">{children}</div>
      </main>
    </div>
  );
}