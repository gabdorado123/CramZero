import { AlertCircle, CheckCircle2, CloudOff, Inbox, LoaderCircle, Search, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const icons = {
  empty: Inbox,
  loading: LoaderCircle,
  error: AlertCircle,
  offline: CloudOff,
  search: Search,
  denied: ShieldAlert,
  success: CheckCircle2,
};

export function CoreState({
  type = 'empty',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  const Icon = icons[type] || icons.empty;
  const tone = type === 'error' || type === 'denied'
    ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30'
    : type === 'success'
      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
      : 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30';

  return (
    <Card role={type === 'error' || type === 'denied' ? 'alert' : 'status'} className={`rounded-3xl border-dashed p-8 text-center shadow-none ${className}`}>
      <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${tone}`}>
        <Icon size={28} className={type === 'loading' ? 'animate-spin' : ''} />
      </div>
      <h3 className="text-base font-black text-stone-900 dark:text-zinc-100">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500 dark:text-zinc-400">{description}</p>}
      {actionLabel && onAction && (
        <Button type="button" onClick={onAction} className="mt-5 rounded-full font-bold">
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}

