export function PrimaryNavigation({ items, currentView, onNavigate }) {
  return (
    <nav className="order-3 -mx-1 flex max-w-full items-center gap-1 overflow-x-auto border-t border-taupe/15 dark:border-zinc-800 pt-2 md:order-none md:mx-auto md:w-auto md:border-t-0 md:pt-0" aria-label="Primary navigation">
      {items.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-current={isActive ? 'page' : undefined}
            data-tour={`nav-${item.id}`}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold transition-colors md:px-3 md:text-sm ${
              isActive
                ? 'bg-umber text-sand shadow-sm dark:bg-zinc-100 dark:text-zinc-950'
                : 'text-taupe hover:bg-greige/20 hover:text-umber dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
            }`}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
