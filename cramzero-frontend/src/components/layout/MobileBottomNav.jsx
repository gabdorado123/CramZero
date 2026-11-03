export function MobileBottomNav({ items, currentView, onNavigate }) {
  return (
    <nav 
      className="safe-bottom fixed bottom-0 left-0 right-0 z-40 flex items-center justify-start gap-1 overflow-x-auto border-t-2 border-sky-200/80 bg-white/96 px-1.5 pt-2 shadow-[0_-8px_24px_rgb(38_57_77/0.12)] backdrop-blur-2xl transition-all dark:border-sky-900/80 dark:bg-slate-950/96 md:hidden"
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
            className={`flex min-w-[3.1rem] flex-1 flex-col items-center justify-center rounded-xl px-0.5 py-1.5 transition-all duration-150 active:scale-90 select-none min-h-[46px] ${
              isActive
                ? 'text-sky-700 dark:text-sky-300 font-black'
                : 'text-stone-400 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <div className={`relative rounded-full p-1 transition-colors ${isActive ? 'bg-sky-500/15 dark:bg-sky-500/20' : ''}`}>
              <Icon size={19} strokeWidth={isActive ? 2.4 : 1.9} />
              {isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              )}
              {item.badge > 0 && (
                <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[9px] font-black leading-4 text-white">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
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
