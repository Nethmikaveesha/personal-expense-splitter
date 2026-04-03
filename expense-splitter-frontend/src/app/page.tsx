import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* HERO SECTION (FULL SCREEN) */}
      <section className="relative h-screen flex items-center justify-center text-center">

        <Image
          src="/home-hero.png"
          alt="Hero"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 px-4">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Split bills without the spreadsheet.
          </h1>

          <p className="mt-4 text-lg text-zinc-200 max-w-xl mx-auto">
            ExpenseMate helps you track shared expenses and see who owes what instantly.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/register"
              className="rounded-full bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="rounded-full border border-white px-6 py-3 text-white hover:bg-white hover:text-black"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* EXTRA CONTENT → THIS CREATES SCROLL */}
      <section className="bg-white py-16 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 grid gap-6 sm:grid-cols-3">

          <div className="p-6 rounded-xl border">
            <h2 className="font-semibold text-emerald-600">Easy Tracking</h2>
            <p className="text-sm mt-2">Add and manage shared expenses easily.</p>
          </div>

          <div className="p-6 rounded-xl border">
            <h2 className="font-semibold text-emerald-600">Fair Splitting</h2>
            <p className="text-sm mt-2">Automatically calculate who owes what.</p>
          </div>

          <div className="p-6 rounded-xl border">
            <h2 className="font-semibold text-emerald-600">Real-time Updates</h2>
            <p className="text-sm mt-2">Always stay updated with balances.</p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}