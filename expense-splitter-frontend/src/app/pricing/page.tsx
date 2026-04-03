import { Footer } from "@/components/Footer";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "Rs. 0",
      features: ["Add expenses", "Basic splitting", "View balances"],
    },
    {
      name: "Pro",
      price: "Rs. 999/month",
      features: ["Everything in Free", "Advanced reports", "Priority support"],
    },
    {
      name: "Team",
      price: "Rs. 1999/month",
      features: ["Everything in Pro", "Admin controls", "Team management"],
    },
  ];

  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
          Pricing
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Simple and transparent pricing.
        </p>
      </section>

      {/* PRICING CARDS */}
      <section className="mx-auto max-w-5xl px-4 pb-16 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="rounded-2xl border p-6 bg-white shadow-sm dark:bg-zinc-900/40"
          >
            <h2 className="text-lg font-semibold text-emerald-600">
              {plan.name}
            </h2>

            <p className="mt-2 text-2xl font-bold">{plan.price}</p>

            <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>

            <button className="mt-6 w-full rounded-full bg-emerald-600 py-2 text-white hover:bg-emerald-700">
              Choose Plan
            </button>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}