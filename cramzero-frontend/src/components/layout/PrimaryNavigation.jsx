export function PrimaryNavigation({ items, currentView, onNavigate }) {
  return (
    <nav 
      className="hidden md:flex items-center gap-1 p-1 bg-stone-200/50 dark:bg-zinc-900/90 rounded-2xl border border-stone-200/80 dark:border-zinc-800/80 mx-auto w-auto" 
      aria-label="Desktop primary navigation"
    >
      {items.map((item) => {
        const isActive = currentView === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-current={isActive ? 'page' : undefined}
            data-tour={`nav-${item.id}`}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 md:text-sm select-none ${
              isActive
                ? 'bg-white text-stone-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100 font-bold'
                : 'text-stone-500 hover:text-stone-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Icon size={15} className={isActive ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400 dark:text-zinc-500'} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
