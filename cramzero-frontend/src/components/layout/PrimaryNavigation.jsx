export function PrimaryNavigation({ items, currentView, onNavigate }) {
  return (
    <nav 
      className="cz-surface flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full p-1 sm:gap-1"
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
            title={item.label}
            className={`flex shrink-0 select-none items-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-semibold transition-all active:scale-95 md:px-3 md:text-sm ${
              isActive
                ? 'bg-sky-500 text-white shadow-sm dark:bg-sky-600 dark:text-white font-bold'
                : 'text-stone-500 hover:text-stone-900 hover:bg-white/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Icon size={15} className={isActive ? 'text-white' : 'text-stone-400 dark:text-zinc-500'} />
            <span className={isActive ? 'inline' : 'hidden lg:inline'}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
