export function WorkspaceSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner Skeleton */}
      <div className="rounded-3xl border border-stone-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 w-full max-w-xl">
            <div className="h-6 w-32 rounded-full bg-amber-100/70 dark:bg-amber-950/40 animate-pulse" />
            <div className="h-9 w-3/4 rounded-2xl bg-stone-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-4 w-full rounded-xl bg-stone-200/70 dark:bg-zinc-800/70 animate-pulse" />
            <div className="flex gap-2 pt-1">
              <div className="h-7 w-20 rounded-full bg-stone-200/70 dark:bg-zinc-800/70 animate-pulse" />
              <div className="h-7 w-24 rounded-full bg-stone-200/70 dark:bg-zinc-800/70 animate-pulse" />
              <div className="h-7 w-28 rounded-full bg-stone-200/70 dark:bg-zinc-800/70 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto shrink-0">
            <div className="h-12 w-36 rounded-2xl bg-amber-400/50 dark:bg-amber-500/30 animate-pulse" />
            <div className="h-12 w-28 rounded-2xl bg-stone-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid (4 intuitive tiles) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-zinc-800 animate-pulse shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-4 w-20 rounded bg-stone-200 dark:bg-zinc-800 animate-pulse" />
                <div className="h-3 w-28 rounded bg-stone-200/70 dark:bg-zinc-800/70 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2 Key Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <div key={i} className="p-5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-3">
            <div className="h-3 w-28 rounded bg-stone-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-stone-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-3 w-44 rounded bg-stone-200/70 dark:bg-zinc-800/70 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Decks Preview Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 w-32 rounded bg-stone-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-4 w-16 rounded bg-stone-200 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 w-20 rounded-full bg-amber-100 dark:bg-amber-950/40 animate-pulse" />
                <div className="h-4 w-4 rounded-full bg-stone-200 dark:bg-zinc-800 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-40 rounded bg-stone-200 dark:bg-zinc-800 animate-pulse" />
                <div className="h-3 w-56 rounded bg-stone-200/70 dark:bg-zinc-800/70 animate-pulse" />
              </div>
              <div className="h-2 w-full rounded-full bg-stone-200/80 dark:bg-zinc-800/80 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
