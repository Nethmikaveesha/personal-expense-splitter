import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
          About ExpenseMate
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-zinc-600 dark:text-zinc-400">
          ExpenseMate is designed to make splitting bills simple, fair, and stress-free.
        </p>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-4xl px-4 pb-16 space-y-6 text-zinc-600 dark:text-zinc-400">
        
        <p>
          Managing shared expenses can be confusing, especially when dealing with friends,
          roommates, or group trips. ExpenseMate simplifies this process by helping users
          track expenses and calculate balances automatically.
        </p>

        <p>
          Our goal is to provide a clean, intuitive, and efficient platform that removes
          the hassle of manual calculations and ensures transparency among users.
        </p>

        <p>
          Whether you're splitting rent, travel costs, or daily expenses, ExpenseMate
          helps you stay organized and financially aware.
        </p>

      </section>

      <Footer />
    </div>
  );
}