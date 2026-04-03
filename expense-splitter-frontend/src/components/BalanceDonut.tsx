"use client";

type BalanceDonutProps = {
  owedToYou: number;
  youOwe: number;
  className?: string;
};

/**
 * Donut showing split between total amounts others owe you vs you owe others.
 * Percentages are shares of gross settlement (|owed| + |owe|), not net.
 */
export function BalanceDonut({ owedToYou, youOwe, className = "" }: BalanceDonutProps) {
  const gross = owedToYou + youOwe;
  const pctOwed = gross > 0 ? Math.round((owedToYou / gross) * 1000) / 10 : 0;
  const pctOwe = gross > 0 ? Math.round((youOwe / gross) * 1000) / 10 : 0;

  if (gross <= 0) {
    return (
      <div
        className={`flex h-52 w-52 flex-col items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 text-center dark:border-zinc-600 dark:bg-zinc-900/40 ${className}`}
      >
        <span className="px-4 text-xs text-zinc-500 dark:text-zinc-400">
          Add shared expenses to see how money splits between owed to you and owed by you.
        </span>
      </div>
    );
  }

  const p = owedToYou / gross;
  const deg = p * 360;
  const emerald = "#059669";
  const rose = "#e11d48";

  return (
    <div className={`relative ${className}`}>
      <div
        className="h-52 w-52 rounded-full shadow-inner ring-1 ring-zinc-200/80 dark:ring-zinc-700/80"
        style={{
          background: `conic-gradient(${emerald} 0deg ${deg}deg, ${rose} ${deg}deg 360deg)`,
        }}
      />
      <div className="absolute inset-9 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-sm dark:bg-zinc-950">
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Settlement mix
        </span>
        <span className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
          {pctOwed}%
        </span>
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">owed to you</span>
        <span className="mt-2 text-lg font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
          {pctOwe}%
        </span>
        <span className="text-[11px] text-rose-600 dark:text-rose-400">you owe</span>
      </div>
    </div>
  );
}
