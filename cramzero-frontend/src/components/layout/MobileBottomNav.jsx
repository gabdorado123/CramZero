export function MobileBottomNav({ items, currentView, onNavigate }) {
  return (
    <nav 
      className="safe-bottom fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200/80 bg-white/96 px-1.5 pt-1 shadow-[0_-8px_24px_rgb(38_57_77/0.08)] backdrop-blur-2xl transition-all dark:border-zinc-800/80 dark:bg-zinc-950/96 md:hidden"
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
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-stone-400 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <div className={`relative rounded-full p-1 transition-colors ${isActive ? 'bg-sky-500/15 dark:bg-sky-500/20' : ''}`}>
              <Icon size={19} strokeWidth={isActive ? 2.4 : 1.9} />
              {isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
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
