import { useState, useEffect, useRef } from 'react';
import { Gauge, Sparkles, Layers, FileText, X, RotateCw, CheckCircle2, AlertCircle, Heart, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { API_BASE } from '@/lib/api';

const DAILY_HEART_LIMIT = 30;
const DAILY_KEY_LIMIT = 30;
const DAILY_USAGE_STORAGE_KEY = 'cramzero-quiz-daily-usage';

const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const readQuizUsage = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(DAILY_USAGE_STORAGE_KEY) || 'null');
    if (stored?.date === getTodayKey()) {
      return {
        hearts: Number.isFinite(stored.hearts) ? stored.hearts : 0,
        keys: Number.isFinite(stored.keys) ? stored.keys : 0,
      };
    }
  } catch (error) {
    console.warn('Could not load quiz usage status:', error);
  }
  return { hearts: 0, keys: 0 };
};

export function UsageTracker({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizUsage, setQuizUsage] = useState(readQuizUsage);
  const [quizPolicy, setQuizPolicy] = useState({ hearts: DAILY_HEART_LIMIT, keys: DAILY_KEY_LIMIT, unlimited: false });
  const [usage, setUsage] = useState({
    deck_generation: { used: 0, limit: 5, remaining: 5, label: 'deck generations' },
    chat: { used: 0, limit: 30, remaining: 30, label: 'Zero AI chats' },
    readout: { used: 0, limit: 10, remaining: 10, label: 'reading guide PDF exports' },
  });
  const popoverRef = useRef(null);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE}/api/rate-limits/${userId ? `?user_id=${encodeURIComponent(userId)}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
      if (userId) {
        const policyResponse = await fetch(`${API_BASE}/api/quiz-usage-policy?user_id=${encodeURIComponent(userId)}`);
        if (policyResponse.ok) {
          const policy = await policyResponse.json();
          setQuizPolicy({
            hearts: policy.hearts,
            keys: policy.keys,
            unlimited: policy.unlimited,
          });
        }
      }
    } catch (err) {
      console.warn('Could not load rate limit status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
    // Poll usage every 60 seconds
    const interval = setInterval(fetchUsage, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const refreshQuizUsage = () => setQuizUsage(readQuizUsage());
    window.addEventListener('cramzero-quiz-usage-updated', refreshQuizUsage);
    window.addEventListener('storage', refreshQuizUsage);
    const interval = setInterval(refreshQuizUsage, 60000);
    return () => {
      window.removeEventListener('cramzero-quiz-usage-updated', refreshQuizUsage);
      window.removeEventListener('storage', refreshQuizUsage);
      clearInterval(interval);
    };
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const deckData = usage.deck_generation || { used: 0, limit: 5, remaining: 5 };
  const chatData = usage.chat || { used: 0, limit: 30, remaining: 30 };
  const readoutData = usage.readout || { used: 0, limit: 10, remaining: 10 };

  const getProgressColor = (used, limit) => {
    if (!limit) return 'bg-sky-500';
    const ratio = used / limit;
    if (ratio >= 1) return 'bg-rose-500';
    if (ratio >= 0.7) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Pill Trigger Button on Navigation Bar */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchUsage();
        }}
        title="View your daily AI generation and chat usage"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 active:scale-95 ${
          isOpen
            ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400 shadow-sm'
            : 'bg-stone-100/90 dark:bg-zinc-900/90 border-stone-200/80 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 hover:border-amber-400 dark:hover:border-amber-500'
        }`}
      >
        <Gauge size={14} className={deckData.remaining <= 1 ? "text-rose-500 animate-pulse" : "text-amber-500"} />
        <span className="hidden sm:inline">Usage</span>
        <span className="inline-flex items-center font-mono text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-stone-200/60 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200">
          {deckData.remaining}/5
        </span>
      </button>

      {/* Floating Quota Popover (One UI / iOS Frosted Dialog) */}
      {isOpen && (
        <div className="fixed inset-x-3 top-16 sm:inset-x-auto sm:absolute sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-1.5rem)] p-4 sm:p-5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl border border-stone-200/90 dark:border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Gauge size={16} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-zinc-100 leading-none">Daily AI Quota</h4>
                <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-1">Resets every 24h at 00:00 UTC</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={fetchUsage}
                disabled={loading}
                title="Refresh usage"
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <RotateCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {/* Deck Generations */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                <span className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-zinc-200">
                  <Layers size={13} className="text-amber-500" /> Deck Generations
                </span>
                <span className="font-mono text-[11px] text-stone-600 dark:text-zinc-400">
                  {deckData.unlimited ? <strong className="text-sky-600 dark:text-sky-400">Unlimited</strong> : <><strong className="text-stone-900 dark:text-zinc-100">{deckData.used}</strong> / {deckData.limit} used ({deckData.remaining} left)</>}
                </span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getProgressColor(deckData.used, deckData.limit)}`}
                  style={{ width: `${deckData.unlimited ? 100 : Math.min(100, (deckData.used / deckData.limit) * 100)}%` }}
                />
              </div>
            </div>

            {/* Zero AI Chats */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                <span className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-zinc-200">
                  <img src="/zero-ai-avatar.webp" alt="" className="h-4 w-4 object-contain" /> Zero AI Chats
                </span>
                <span className="font-mono text-[11px] text-stone-600 dark:text-zinc-400">
                  {chatData.unlimited ? <strong className="text-sky-600 dark:text-sky-400">Unlimited</strong> : <><strong className="text-stone-900 dark:text-zinc-100">{chatData.used}</strong> / {chatData.limit} used ({chatData.remaining} left)</>}
                </span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getProgressColor(chatData.used, chatData.limit)}`}
                  style={{ width: `${chatData.unlimited ? 100 : Math.min(100, (chatData.used / chatData.limit) * 100)}%` }}
                />
              </div>
            </div>

            {/* Reading Guide PDFs */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                <span className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-zinc-200">
                  <FileText size={13} className="text-emerald-500" /> Study Guide PDFs
                </span>
                <span className="font-mono text-[11px] text-stone-600 dark:text-zinc-400">
                  {readoutData.unlimited ? <strong className="text-sky-600 dark:text-sky-400">Unlimited</strong> : <><strong className="text-stone-900 dark:text-zinc-100">{readoutData.used}</strong> / {readoutData.limit} used ({readoutData.remaining} left)</>}
                </span>
              </div>

              {/* Knowledge Check Resources */}
              <div className="border-t border-stone-100 pt-4 dark:border-zinc-800">
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-zinc-200">
                    <Heart size={13} className="text-rose-500" fill="currentColor" /> Knowledge Check Hearts
                  </span>
                  <span className="font-mono text-[11px] text-stone-600 dark:text-zinc-400">
                    {quizPolicy.unlimited ? <strong className="text-sky-600 dark:text-sky-400">Unlimited</strong> : <><strong className="text-stone-900 dark:text-zinc-100">{quizUsage.hearts}</strong> / {quizPolicy.hearts} used ({Math.max(0, quizPolicy.hearts - quizUsage.hearts)} left)</>}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 p-0.5 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getProgressColor(quizUsage.hearts, quizPolicy.hearts)}`}
                    style={{ width: `${quizPolicy.unlimited ? 100 : Math.min(100, (quizUsage.hearts / quizPolicy.hearts) * 100)}%` }}
                  />
                </div>
                <div className="mb-1.5 mt-3 flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-zinc-200">
                    <KeyRound size={13} className="text-amber-500" /> Hint Keys
                  </span>
                  <span className="font-mono text-[11px] text-stone-600 dark:text-zinc-400">
                    {quizPolicy.unlimited ? <strong className="text-sky-600 dark:text-sky-400">Unlimited</strong> : <><strong className="text-stone-900 dark:text-zinc-100">{quizUsage.keys}</strong> / {quizPolicy.keys} used ({Math.max(0, quizPolicy.keys - quizUsage.keys)} left)</>}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 p-0.5 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getProgressColor(quizUsage.keys, quizPolicy.keys)}`}
                    style={{ width: `${quizPolicy.unlimited ? 100 : Math.min(100, (quizUsage.keys / quizPolicy.keys) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="w-full bg-stone-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getProgressColor(readoutData.used, readoutData.limit)}`}
                  style={{ width: `${readoutData.unlimited ? 100 : Math.min(100, (readoutData.used / readoutData.limit) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Speed & Optimization Notice */}
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800/80 flex items-start gap-2 bg-stone-50/70 dark:bg-zinc-800/40 p-2.5 rounded-2xl">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-snug">
              <strong className="text-stone-700 dark:text-zinc-200 font-semibold">Instant AI Caching Active:</strong> Common topics and shared guides load instantly without server delays.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
