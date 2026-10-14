import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  BookOpen, Clock, FileText, Send, ChevronLeft, ChevronRight, RotateCw, Menu, X,
  MessageCircle, UploadCloud, Sparkles, Home, Library, Users, BarChart2, Play, Plus,
  ArrowLeft, Mic, MicOff, Volume2, Settings, Edit3, Trash2, HelpCircle, CheckCircle,
  Search, Layers, Brain, Zap, MessageSquare, TrendingUp, Calendar, Target,
  Shuffle, Maximize, Minimize, RotateCcw, Star, Check, ArrowRight, ShieldCheck, Award, Code, Cpu,
  Download, Share2, Timer, PieChart, Activity, AlertTriangle, Link as LinkIcon, Inbox,
  Sun, Moon, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from '@/components/ui/bubble';
import { Marker, MarkerContent } from '@/components/ui/marker';
import { Message, MessageAvatar, MessageContent, MessageFooter } from '@/components/ui/message';
import ReactMarkdown from 'react-markdown';
import { getAnalyticsEvents, subscribeToAnalytics } from '@/lib/analytics';

export function DashboardView({ navigateTo, setHasActiveDeck, myDecks }) {
  const [events, setEvents] = useState(() => getAnalyticsEvents());
  const handleStartStudying = () => { setHasActiveDeck(true); navigateTo('study'); };

  useEffect(() => subscribeToAnalytics(setEvents), []);
  
  if (myDecks.length === 0) {
    return (
      <div className="flex-1 w-full min-h-[70vh] flex flex-col items-center justify-center p-4 md:p-8 my-auto">
        <Card data-tour="dashboard-welcome" className="max-w-lg w-full p-8 md:p-12 text-center border-dashed border-stone-300 dark:border-zinc-800 shadow-none bg-transparent mx-auto">
          <div className="w-20 h-20 bg-stone-200/50 dark:bg-zinc-800/60 text-umber dark:text-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Inbox size={40} />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-extrabold mb-2 text-umber dark:text-zinc-100 tracking-tight">
            Welcome to CramZero!
          </CardTitle>
          <CardDescription className="text-sm md:text-base mb-8 text-taupe dark:text-zinc-400 max-w-md mx-auto">
            Your workspace is currently empty. Create your first deck to unlock insights and begin studying.
          </CardDescription>
          <Button onClick={() => navigateTo('new-deck')} size="lg" className="bg-umber dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-umber/90 dark:hover:bg-zinc-200 mx-auto font-bold rounded-xl h-12 px-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center">
            <Plus size={18} className="mr-2" /> Create First Deck
          </Button>
        </Card>
      </div>
    );
  }

  const reviewEvents = events.filter(event => event.type === 'flashcard_rating' || event.type === 'quiz_answer');
  const masteryScores = reviewEvents.map(event => {
    if (event.type === 'quiz_answer') return event.correct ? 100 : 0;
    return { hard: 33, good: 67, easy: 100 }[event.rating] || 0;
  });
  const globalMastery = masteryScores.length
    ? Math.round(masteryScores.reduce((total, score) => total + score, 0) / masteryScores.length)
    : 0;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const activeDays = new Set(reviewEvents.filter(event => event.recordedAt?.startsWith(currentMonth)).map(event => event.recordedAt.slice(0, 10))).size;
  const cardsConquered = events.filter(event => (event.type === 'flashcard_rating' && event.rating === 'easy') || (event.type === 'quiz_answer' && event.correct)).length;
  const aiInteractions = events.filter(event => event.type === 'ai_question').length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      <Card data-tour="dashboard-welcome" className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-stone-200/80 dark:border-zinc-800 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-umber dark:text-zinc-100 mb-2 tracking-tight">Welcome back!</h2>
            <p className="text-taupe dark:text-zinc-400 text-sm md:text-base">You have {myDecks.length} deck{myDecks.length > 1 ? 's' : ''} to review today. Ready to crush it?</p>
          </div>
          <Button size="lg" onClick={handleStartStudying} className="bg-umber dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-200 rounded-xl font-bold h-12 px-6 w-full md:w-auto shadow-sm hover:shadow-md transition-all">
            <Play size={17} fill="currentColor" className="mr-2" /> Resume Last Session
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { title: 'Global Mastery', icon: Brain, val: `${globalMastery}%`, sub: 'Avg. confidence rating', color: 'text-emerald-600 dark:text-emerald-500' },
          { title: 'Study Momentum', icon: Zap, val: `${activeDays}`, sub: 'Active days this month', color: 'text-amber-600 dark:text-amber-500' },
          { title: 'Cards Conquered', icon: Target, val: `${cardsConquered}`, sub: 'Successful reviews', color: 'text-umber dark:text-zinc-100' },
          { title: 'AI Interactions', icon: MessageSquare, val: `${aiInteractions}`, sub: 'Questions asked to Zero', color: 'text-blue-600 dark:text-blue-400' },
        ].map((stat, i) => (
          <Card key={i} className="hover:-translate-y-1 transition-all rounded-2xl cursor-default shadow-xs hover:shadow-md border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center gap-2 text-taupe dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4"><stat.icon size={16} className={stat.color} /> {stat.title}</div>
              <div><p className="text-3xl font-extrabold text-umber dark:text-zinc-100 mb-1">{stat.val}</p><p className="text-xs font-semibold text-taupe dark:text-zinc-500">{stat.sub}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
