import { Footer } from "@/components/Footer";

export default function FeaturesPage() {
  const features = [
    {
      title: "Easy Expense Tracking",
      desc: "Quickly add and manage shared expenses with your friends or groups.",
    },
    {
      title: "Smart Bill Splitting",
      desc: "Automatically calculate who owes what with fair and simple logic.",
    },
    {
      title: "Real-Time Balances",
      desc: "See your updated balances instantly after every expense.",
    },
    {
      title: "Group Management",
      desc: "Create groups for trips, events, or roommates.",
    },
    {
      title: "Secure Authentication",
      desc: "Your data is protected with secure login and session handling.",
    },
    {
      title: "Admin Controls",
      desc: "Admins can manage users and monitor system activity.",
    },
  ];

  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
          Features
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Everything you need to manage shared expenses easily.
        </p>
      </section>

      {/* FEATURES GRID */}
      <section className="mx-auto max-w-5xl px-4 pb-16 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="p-6 rounded-2xl border bg-white shadow-sm dark:bg-zinc-900/40"
          >
            <h2 className="font-semibold text-emerald-600">{f.title}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}