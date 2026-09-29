import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, PieChart, Target, Timer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAnalyticsEvents, subscribeToAnalytics } from '@/lib/analytics';

const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

const formatDay = (date) => new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date);

const buildSummary = (events) => {
  const reviewEvents = events.filter((event) => event.type === 'flashcard_rating' || event.type === 'quiz_answer');
  const correctAnswers = events.filter((event) => event.type === 'quiz_answer' && event.correct).length;
  const quizAnswers = events.filter((event) => event.type === 'quiz_answer').length;
  const activeDays = new Set(reviewEvents.map((event) => dayKey(event.recordedAt))).size;
  const today = new Date();
  const lastSevenDays = [...Array(7)].map((_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (6 - index));
    const key = dayKey(date);
    return {
      key,
      label: index === 6 ? 'Today' : formatDay(date),
      count: reviewEvents.filter((event) => dayKey(event.recordedAt) === key).length,
    };
  });

  const conceptMap = new Map();
  events.forEach((event) => {
    if (!event.term) return;
    const current = conceptMap.get(event.term) || { term: event.term, attempts: 0, struggles: 0 };
    current.attempts += 1;
    if (event.rating === 'hard' || (event.type === 'quiz_answer' && !event.correct)) current.struggles += 1;
    conceptMap.set(event.term, current);
  });

  const weakConcepts = [...conceptMap.values()]
    .filter((concept) => concept.struggles > 0)
    .sort((a, b) => b.struggles - a.struggles || b.attempts - a.attempts)
    .slice(0, 4);

  const deckMap = new Map();
  reviewEvents.forEach((event) => {
    const title = event.deckTitle || 'Untitled deck';
    const current = deckMap.get(title) || { title, reviews: 0, quizAnswers: 0, correct: 0, struggles: 0 };
    current.reviews += 1;
    if (event.type === 'quiz_answer') {
      current.quizAnswers += 1;
      if (event.correct) current.correct += 1;
      if (!event.correct) current.struggles += 1;
    }
    if (event.rating === 'hard') current.struggles += 1;
    deckMap.set(title, current);
  });

  return {
    reviewCount: reviewEvents.length,
    activeDays,
    accuracy: quizAnswers ? Math.round((correctAnswers / quizAnswers) * 100) : null,
    lastSevenDays,
    weakConcepts,
    deckPerformance: [...deckMap.values()].sort((a, b) => b.reviews - a.reviews),
  };
};

export function AnalyticsView() {
  const [events, setEvents] = useState(() => getAnalyticsEvents());
  const summary = buildSummary(events);
  const maxDailyActivity = Math.max(...summary.lastSevenDays.map((day) => day.count), 1);

  useEffect(() => subscribeToAnalytics(setEvents), []);

  if (summary.reviewCount === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <Card className="w-full max-w-lg rounded-3xl border-dashed border-taupe/30 bg-white p-12 text-center shadow-none dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500"><PieChart size={32} /></div>
          <CardTitle className="mb-2 text-xl text-umber dark:text-zinc-100">Your analytics are ready to grow</CardTitle>
          <CardDescription className="mx-auto max-w-md text-taupe dark:text-zinc-400">Rate flashcards or complete a quiz and your real study activity will appear here automatically.</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-12 md:p-8">
      <div className="mb-4 border-b border-taupe/20 pb-6 dark:border-zinc-800">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-taupe dark:text-zinc-500">Live from your study sessions</p>
        <h2 className="mt-2 text-2xl font-bold text-umber dark:text-zinc-100 md:text-3xl">Mastery Analytics</h2>
        <p className="mt-2 text-sm text-taupe dark:text-zinc-400">A running picture of what you practice, remember, and need to revisit.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Reviews', summary.reviewCount, Activity],
          ['Active days', summary.activeDays, Target],
          ['Quiz accuracy', summary.accuracy === null ? '--' : `${summary.accuracy}%`, CheckCircle],
          ['Needs attention', summary.weakConcepts.length, AlertTriangle],
        ].map(([label, value, Icon]) => (
          <Card key={label} className="border-taupe/20 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CardContent className="p-5">
              <Icon size={17} className="mb-4 text-emerald-600 dark:text-emerald-500" />
              <p className="text-2xl font-black text-umber dark:text-zinc-100">{value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-taupe dark:text-zinc-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-taupe/20 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
          <CardContent className="p-6 md:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <h3 className="flex items-center gap-2 font-bold text-lg text-umber dark:text-zinc-100"><Timer size={18} className="text-amber-600 dark:text-amber-500" /> Review activity</h3>
              <Badge variant="outline" className="border-taupe/30 text-taupe dark:border-zinc-700 dark:text-zinc-400">Last 7 days</Badge>
            </div>
            <div className="flex h-48 items-end gap-3 border-b border-taupe/20 pb-2 dark:border-zinc-800">
              {summary.lastSevenDays.map((day) => (
                <div key={day.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-bold text-taupe opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-500">{day.count}</span>
                  <div className="w-full rounded-t-lg bg-emerald-500 transition-all duration-500 dark:bg-emerald-600" style={{ height: `${Math.max(day.count ? (day.count / maxDailyActivity) * 82 : 3, 3)}%` }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-taupe dark:text-zinc-500">{day.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-taupe/20 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <CardContent className="p-6 md:p-8">
            <h3 className="mb-5 flex items-center gap-2 font-bold text-lg text-umber dark:text-zinc-100"><AlertTriangle size={18} className="text-amber-600 dark:text-amber-500" /> Needs attention</h3>
            {summary.weakConcepts.length === 0 ? (
              <div className="flex min-h-32 flex-col items-center justify-center text-center">
                <CheckCircle size={28} className="mb-3 text-emerald-500" />
                <p className="text-sm font-bold text-umber dark:text-zinc-100">No weak concepts yet</p>
                <p className="mt-1 text-xs text-taupe dark:text-zinc-500">Keep practicing to reveal patterns.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {summary.weakConcepts.map((concept) => (
                  <div key={concept.term} className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900 dark:bg-amber-950/20">
                    <p className="truncate text-sm font-bold text-umber dark:text-zinc-200">{concept.term}</p>
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{concept.struggles} struggle{concept.struggles === 1 ? '' : 's'} across {concept.attempts} attempt{concept.attempts === 1 ? '' : 's'}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-taupe/20 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <CardContent className="p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="flex items-center gap-2 font-bold text-lg text-umber dark:text-zinc-100"><Activity size={18} className="text-emerald-600 dark:text-emerald-500" /> Deck performance</h3>
            <span className="text-xs font-medium text-taupe dark:text-zinc-500">Based on recorded sessions</span>
          </div>
          <div className="space-y-3">
            {summary.deckPerformance.map((deck) => {
              const accuracy = deck.quizAnswers ? Math.round((deck.correct / deck.quizAnswers) * 100) : null;
              return (
                <div key={deck.title} className="grid gap-3 rounded-xl border border-taupe/15 bg-sand/20 p-4 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                  <p className="truncate text-sm font-bold text-umber dark:text-zinc-200">{deck.title}</p>
                  <span className="text-xs font-medium text-taupe dark:text-zinc-500">{deck.reviews} review{deck.reviews === 1 ? '' : 's'}</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{accuracy === null ? 'No quiz data' : `${accuracy}% accuracy`}</span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{deck.struggles} struggle{deck.struggles === 1 ? '' : 's'}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
