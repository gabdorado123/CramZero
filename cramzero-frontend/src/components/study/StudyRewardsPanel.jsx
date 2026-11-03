import { useMemo } from 'react';
import {
  Award, Flame, Crown, Sparkles, Trophy, Star, Zap, LockKeyhole
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const REWARDS = [
  { id: 'first-step', icon: Sparkles, title: 'First Spark', description: 'Complete your first review', check: stats => stats.reviews >= 1, color: 'amber' },
  { id: 'sharp-mind', icon: Star, title: 'Sharp Mind', description: 'Answer 10 questions correctly', check: stats => stats.correct >= 10, color: 'violet' },
  { id: 'streak-builder', icon: Flame, title: 'Streak Builder', description: 'Study on 3 different days', check: stats => stats.activeDays >= 3, color: 'rose' },
  { id: 'deck-maker', icon: Trophy, title: 'Deck Maker', description: 'Create 3 study decks', check: stats => stats.decks >= 3, color: 'emerald' },
  { id: 'zero-hero', icon: Crown, title: 'Zero Hero', description: 'Reach 100 XP', check: stats => stats.xp >= 100, color: 'blue' },
];

const colorClasses = {
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
};

const getLevel = xp => Math.max(1, Math.floor(xp / 100) + 1);

export function StudyRewardsPanel({ events, deckCount, displayName = 'You' }) {
  const stats = useMemo(() => {
    const reviews = events.filter(event => event.type === 'flashcard_rating' || event.type === 'quiz_answer');
    const correct = events.filter(event => event.type === 'quiz_answer' && event.correct).length;
    const activeDays = new Set(reviews.map(event => event.recordedAt?.slice(0, 10)).filter(Boolean)).size;
    const xp = reviews.reduce((total, event) => {
      if (event.type === 'quiz_answer') return total + (event.correct ? 12 : 3);
      return total + ({ easy: 10, good: 7, hard: 4 }[event.rating] || 2);
    }, 0);
    const unlocked = REWARDS.filter(reward => reward.check({ reviews: reviews.length, correct, activeDays, decks: deckCount, xp }));
    return { reviews: reviews.length, correct, activeDays, xp, unlocked };
  }, [events, deckCount]);

  const level = getLevel(stats.xp);
  const levelProgress = Math.min(100, stats.xp % 100);
  const leaderboard = [
    { name: 'FocusFox', xp: 260, avatar: '🦊' },
    { name: 'StudySprout', xp: 190, avatar: '🌱' },
    { name: displayName, xp: stats.xp, avatar: '✨', isUser: true },
    { name: 'NoteKnight', xp: 80, avatar: '🛡️' },
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-white shadow-lg lg:col-span-3">
        <CardContent className="relative p-6 sm:p-7">
          <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <Badge className="border-0 bg-white/15 text-violet-100">Your learning quest</Badge>
              <h3 className="mt-3 text-2xl font-black tracking-tight">Level {level} learner</h3>
              <p className="mt-1 text-sm text-violet-100">Every review powers your next unlock.</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3"><Zap size={24} className="text-yellow-200" fill="currentColor" /></div>
          </div>
          <div className="relative mt-6">
            <div className="mb-2 flex justify-between text-xs font-bold text-violet-100">
              <span>{stats.xp} XP earned</span><span>{100 - levelProgress} XP to next level</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-black/20">
              <div className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 transition-all duration-700" style={{ width: `${levelProgress}%` }} />
            </div>
          </div>
          <div className="relative mt-6 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/10 p-3"><p className="text-xl font-black">{stats.reviews}</p><p className="text-[10px] font-bold uppercase text-violet-100">Reviews</p></div>
            <div className="rounded-2xl bg-white/10 p-3"><p className="text-xl font-black">{stats.correct}</p><p className="text-[10px] font-bold uppercase text-violet-100">Correct</p></div>
            <div className="rounded-2xl bg-white/10 p-3"><p className="text-xl font-black">{stats.activeDays}</p><p className="text-[10px] font-bold uppercase text-violet-100">Study days</p></div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-stone-200/80 bg-white/90 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 lg:col-span-2">
        <CardContent className="p-6 sm:p-7">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-black text-stone-900 dark:text-zinc-100"><Trophy size={18} className="text-amber-500" /> Weekly challenge</h3>
            <Badge variant="outline" className="rounded-full text-[10px]">Local board</Badge>
          </div>
          <div className="space-y-2.5">
            {leaderboard.map((player, index) => (
              <div key={`${player.name}-${index}`} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${player.isUser ? 'bg-amber-50 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:ring-amber-900' : 'bg-stone-50 dark:bg-zinc-800/60'}`}>
                <span className="w-5 text-center text-xs font-black text-stone-400">{index + 1}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-lg shadow-sm dark:bg-zinc-700">{player.avatar}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-stone-800 dark:text-zinc-200">{player.name}{player.isUser && <span className="ml-1 text-[10px] font-medium text-amber-600">(you)</span>}</span>
                <span className="text-xs font-black text-violet-600 dark:text-violet-300">{player.xp} XP</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-stone-500 dark:text-zinc-400">A friendly local challenge for now. Connect with a Study Hub to compete with classmates.</p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-stone-200/80 bg-white/90 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 lg:col-span-5">
        <CardContent className="p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div><h3 className="flex items-center gap-2 font-black text-stone-900 dark:text-zinc-100"><Award size={18} className="text-amber-500" /> Collectibles</h3><p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">{stats.unlocked.length} of {REWARDS.length} badges unlocked</p></div>
            <div className="text-sm font-black text-amber-600 dark:text-amber-400">{stats.unlocked.length}/{REWARDS.length}</div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {REWARDS.map(reward => {
              const unlocked = stats.unlocked.some(item => item.id === reward.id);
              const Icon = reward.icon;
              return <div key={reward.id} className={`rounded-2xl border p-3 text-center transition-all ${unlocked ? 'border-stone-200 bg-stone-50 dark:border-zinc-700 dark:bg-zinc-800/70' : 'border-dashed border-stone-200 opacity-55 dark:border-zinc-800'}`}>
                <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-2xl ${unlocked ? colorClasses[reward.color] : 'bg-stone-100 text-stone-400 dark:bg-zinc-800 dark:text-zinc-500'}`}>{unlocked ? <Icon size={20} /> : <LockKeyhole size={17} />}</div>
                <p className="mt-2 truncate text-xs font-black text-stone-800 dark:text-zinc-200">{reward.title}</p>
                <p className="mt-1 text-[10px] leading-tight text-stone-500 dark:text-zinc-500">{reward.description}</p>
              </div>;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
