export function MobileBottomNav({ items, currentView, onNavigate }) {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-t border-stone-200/80 dark:border-zinc-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.5)] px-1.5 py-1 pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around transition-all"
      aria-label="Mobile primary navigation"
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
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-0.5 rounded-xl transition-all duration-150 active:scale-90 select-none min-h-[46px] ${
              isActive
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-stone-400 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <div className={`relative p-1 rounded-xl transition-colors ${isActive ? 'bg-amber-500/15 dark:bg-amber-500/20' : ''}`}>
              <Icon size={19} strokeWidth={isActive ? 2.4 : 1.9} />
              {isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none max-w-[54px] truncate">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

