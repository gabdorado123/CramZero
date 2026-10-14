export function PrimaryNavigation({ items, currentView, onNavigate }) {
  return (
    <nav className="order-3 -mx-1 flex max-w-full items-center gap-1 overflow-x-auto p-1 bg-stone-200/50 dark:bg-zinc-900/90 rounded-xl border border-stone-200/80 dark:border-zinc-800/80 md:order-none md:mx-auto md:w-auto" aria-label="Primary navigation">
      {items.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-current={isActive ? 'page' : undefined}
            data-tour={`nav-${item.id}`}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all md:text-sm ${
              isActive
                ? 'bg-white text-umber shadow-xs dark:bg-zinc-800 dark:text-zinc-100 font-bold'
                : 'text-taupe hover:text-umber hover:bg-white/60 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <item.icon size={15} className={isActive ? 'text-amber-600 dark:text-amber-400' : 'text-taupe/80 dark:text-zinc-500'} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
