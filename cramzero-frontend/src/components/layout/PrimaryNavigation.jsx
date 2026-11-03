export function PrimaryNavigation({ items, currentView, onNavigate }) {
  return (
    <nav 
      className="cz-game-nav flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full p-1 sm:gap-1"
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
            className={`flex shrink-0 select-none items-center gap-1.5 rounded-2xl border-2 px-2.5 py-2 text-xs font-black transition-all active:scale-95 md:px-3 md:text-sm ${
              isActive
                ? 'border-sky-700/40 bg-sky-500 text-white shadow-[0_3px_0_rgb(3_105_161)] dark:bg-sky-600 dark:text-white'
                : 'border-transparent text-stone-500 hover:border-sky-100 hover:bg-sky-50 hover:text-sky-800 dark:text-zinc-400 dark:hover:border-sky-900 dark:hover:bg-sky-950/60 dark:hover:text-zinc-100'
            }`}
          >
            <Icon size={15} className={isActive ? 'text-white' : 'text-stone-400 dark:text-zinc-500'} />
            <span className={isActive ? 'inline' : 'hidden lg:inline'}>{item.label}</span>
            {item.badge > 0 && (
              <span className="ml-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black leading-4 text-white">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
