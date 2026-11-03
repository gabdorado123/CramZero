import { useEffect, useState } from 'react';
import { ArrowLeft, Bell, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_BASE } from '@/lib/api';
import { toast } from 'sonner';
import {
  getInAppNotifications,
  markInAppNotificationRead,
  IN_APP_NOTIFICATIONS_UPDATED,
} from '@/lib/inAppNotifications';

export function NotificationsView({ navigateTo, userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = () => {
    setIsLoading(true);
    const localNotifications = getInAppNotifications();
    setNotifications(localNotifications);
    fetch(`${API_BASE}/api/notifications?user_id=${encodeURIComponent(userId)}`)
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Could not load notifications.')))
      .then(serverNotifications => setNotifications([...localNotifications, ...serverNotifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))))
      .catch(error => {
        if (localNotifications.length === 0) {
          toast.error('Could not load notifications', { description: error.message });
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadNotifications();
    window.addEventListener(IN_APP_NOTIFICATIONS_UPDATED, loadNotifications);
    return () => window.removeEventListener(IN_APP_NOTIFICATIONS_UPDATED, loadNotifications);
  }, [userId]);

  const markRead = async (notification) => {
    if (notification.is_read) return;
    if (notification.source === 'local') {
      markInAppNotificationRead(notification.id);
      setNotifications(current => current.map(item => item.id === notification.id ? { ...item, is_read: true } : item));
      return;
    }
    await fetch(`${API_BASE}/api/notifications/${notification.id}/read?user_id=${encodeURIComponent(userId)}`, { method: 'PATCH' });
    setNotifications(current => current.map(item => item.id === notification.id ? { ...item, is_read: true } : item));
    window.dispatchEvent(new Event('cramzero-in-app-notifications-updated'));
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 md:py-8">
      <div className="flex items-start gap-4 border-b border-stone-200/70 pb-5 dark:border-zinc-800">
        <Button variant="ghost" size="icon" onClick={() => navigateTo('dashboard')} className="rounded-full"><ArrowLeft size={18} /></Button>
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">Inbox</p><h2 className="mt-1 text-2xl font-black text-umber dark:text-zinc-100 sm:text-3xl">Notifications</h2><p className="mt-1 text-sm text-taupe dark:text-zinc-400">Stay updated when learners connect with you.</p></div>
      </div>
      {isLoading ? <Card className="rounded-3xl"><CardContent className="p-10 text-center text-sm text-taupe">Loading notifications...</CardContent></Card> : notifications.length === 0 ? <Card className="rounded-3xl border-dashed"><CardContent className="p-10 text-center"><Bell className="mx-auto mb-3 text-stone-300" size={28} /><p className="text-sm text-taupe">You’re all caught up.</p></CardContent></Card> : <div className="space-y-3">{notifications.map(notification => <button key={notification.id} type="button" onClick={() => markRead(notification)} className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition hover:border-violet-300 ${notification.is_read ? 'border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900' : 'border-violet-200 bg-violet-50/70 dark:border-violet-900 dark:bg-violet-950/20'}`}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300"><Bell size={18} /></div><span className="min-w-0 flex-1 text-sm font-semibold text-stone-800 dark:text-zinc-100">{notification.message}<span className="mt-1 block text-xs font-normal text-stone-500 dark:text-zinc-400">{notification.description || notification.actor?.display_name || ''}</span><span className="mt-1 block text-xs font-normal text-stone-400">{notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}</span></span>{notification.is_read ? <Check size={16} className="text-emerald-500" /> : <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />}</button>)}</div>}
    </div>
  );
}
