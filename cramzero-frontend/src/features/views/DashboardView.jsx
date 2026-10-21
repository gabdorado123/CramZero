import { useEffect, useState } from 'react';
import {
  BookOpen, Clock, FileText, Sparkles, Home, Library, Users, BarChart2, Play, Plus,
  Layers, Brain, Zap, MessageSquare, Target, Award, ArrowRight, UploadCloud, Globe,
  CheckCircle, ChevronRight, Share2, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAnalyticsEvents, subscribeToAnalytics } from '@/lib/analytics';

export function DashboardView({ navigateTo, setHasActiveDeck, setActiveDeck, myDecks = [], displayName = 'Student' }) {
  const [events, setEvents] = useState(() => getAnalyticsEvents());

  useEffect(() => subscribeToAnalytics(setEvents), []);

  const handleLaunchFirstDeck = () => {
    if (myDecks.length > 0) {
      if (setActiveDeck) setActiveDeck(myDecks[0]);
      if (setHasActiveDeck) setHasActiveDeck(true);
      navigateTo('flashcard-mode');
    } else {
      navigateTo('new-deck');
    }
  };

  const handleStudyDeck = (e, deck) => {
    e.stopPropagation();
    if (setActiveDeck) setActiveDeck(deck);
    if (setHasActiveDeck) setHasActiveDeck(true);
    navigateTo('flashcard-mode');
  };

  const handleOpenDeckDetails = (deck) => {
    if (setActiveDeck) setActiveDeck(deck);
    navigateTo('deck-details');
  };

  const handleQuickTopic = (topic) => {
    sessionStorage.setItem('cramzero-prefill-topic', topic);
    navigateTo('new-deck');
  };

  // -------------------------------------------------------------
  // EMPTY STATE (0 DECKS): Welcoming, clear guidance and starter options
  // -------------------------------------------------------------
  if (myDecks.length === 0) {
    const starterTopics = [
      { label: '🧬 Cellular Respiration & ATP', topic: 'Cellular Respiration and ATP Production in Mitochondria' },
      { label: '🐍 Python Data Structures', topic: 'Python Lists, Dictionaries, Sets, and Tuples' },
      { label: '🧠 Cognitive Psychology', topic: 'Cognitive Psychology: Memory Models and Perception' },
      { label: '⚖️ Constitutional Law', topic: 'Constitutional Law: Separation of Powers and Due Process' },
      { label: '⚡ Electrical Circuits', topic: 'Electrical Circuits: Ohms Law and Kirchhoffs Rules' },
    ];

    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 md:space-y-10 animate-in fade-in duration-300">
        {/* Welcome Hero Banner */}
        <div data-tour="dashboard-welcome" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-zinc-900/40 dark:to-transparent border border-amber-500/25 dark:border-amber-900/40 p-6 sm:p-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              <Sparkles size={13} />
              <span>Get Started with CramZero</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-umber dark:text-zinc-100 tracking-tight">
              Welcome, {displayName}!
            </h2>
            <p className="text-taupe dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
              Your study workspace is ready. Generate flashcards with AI, upload your lecture slides, or explore public community decks to start studying right away.
            </p>
          </div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-500/15 dark:bg-amber-500/25 rounded-3xl p-3 sm:p-4 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-sm">
            <img src="/cramzero-logo.svg" alt="CramZero" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* 3 Clear Starter Paths */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-taupe dark:text-zinc-400 mb-4">
            Choose how you want to start
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Path 1: AI Prompt */}
            <Card 
              onClick={() => navigateTo('new-deck')}
              className="bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 rounded-3xl p-6 hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer group flex flex-col justify-between hover:-translate-y-1 shadow-xs"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles size={24} />
                </div>
                <h4 className="font-extrabold text-lg text-umber dark:text-zinc-100 mb-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Generate with AI
                </h4>
                <p className="text-taupe dark:text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                  Type any subject or exam topic. Zero AI creates structured cards and clear definitions in seconds.
                </p>
              </div>
              <Button className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs group-hover:shadow-md transition-all">
                Create with AI <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Card>

            {/* Path 2: File Upload */}
            <Card 
              onClick={() => {
                sessionStorage.setItem('cramzero-mode-tab', 'file');
                navigateTo('new-deck');
              }}
              className="bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 rounded-3xl p-6 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group flex flex-col justify-between hover:-translate-y-1 shadow-xs"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} />
                </div>
                <h4 className="font-extrabold text-lg text-umber dark:text-zinc-100 mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Upload Notes or Slides
                </h4>
                <p className="text-taupe dark:text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                  Drop in your PDF, PowerPoint (.pptx), or plain text (.txt) lecture materials to synthesize flashcards automatically.
                </p>
              </div>
              <Button variant="outline" className="w-full h-11 rounded-xl border-stone-200 dark:border-zinc-800 hover:border-blue-400 text-umber dark:text-zinc-200 font-bold text-xs bg-white dark:bg-zinc-900 group-hover:shadow-md transition-all">
                Upload Document <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Card>

            {/* Path 3: Explore Community */}
            <Card 
              onClick={() => navigateTo('decks')}
              className="bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 rounded-3xl p-6 hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer group flex flex-col justify-between hover:-translate-y-1 shadow-xs"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe size={24} />
                </div>
                <h4 className="font-extrabold text-lg text-umber dark:text-zinc-100 mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Explore Public Decks
                </h4>
                <p className="text-taupe dark:text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                  Clone ready-to-study flashcard sets shared by other students and professors around the world.
                </p>
              </div>
              <Button variant="outline" className="w-full h-11 rounded-xl border-stone-200 dark:border-zinc-800 hover:border-emerald-400 text-umber dark:text-zinc-200 font-bold text-xs bg-white dark:bg-zinc-900 group-hover:shadow-md transition-all">
                Browse Community <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Card>
          </div>
        </div>

        {/* Starter Topics Inspiration */}
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-zinc-900/60 border border-stone-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-amber-500" />
            <h4 className="font-bold text-sm text-umber dark:text-zinc-200">
              Or try generating one of these popular topics:
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {starterTopics.map((st, i) => (
              <button
                key={i}
                onClick={() => handleQuickTopic(st.topic)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-900 dark:hover:text-amber-300 border border-stone-200/70 dark:border-zinc-700/60 transition-all active:scale-95 text-left"
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // POPULATED DASHBOARD: Quick actions, stats, and recent decks
  // -------------------------------------------------------------
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
  const recentDecks = myDecks.slice(0, 3);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Hero Banner with Quick Study CTA */}
      <Card data-tour="dashboard-welcome" className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-stone-200/80 dark:border-zinc-800 shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Workspace Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-umber dark:text-zinc-100 tracking-tight">
              Welcome back, {displayName}!
            </h2>
            <p className="text-taupe dark:text-zinc-400 text-sm md:text-base leading-relaxed">
              You have <span className="font-bold text-umber dark:text-zinc-200">{myDecks.length} deck{myDecks.length > 1 ? 's' : ''}</span> in your library ready for review. What would you like to conquer today?
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
            <Button 
              size="lg" 
              onClick={handleLaunchFirstDeck} 
              className="bg-umber dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-200 rounded-xl font-bold h-12 px-6 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Play size={16} fill="currentColor" /> Study Flashcards
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigateTo('new-deck')} 
              className="rounded-xl font-bold h-12 px-5 border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-800 text-umber dark:text-zinc-200 flex items-center justify-center gap-2"
            >
              <Plus size={16} /> New Deck
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Navigation Grid (4 intuitive tiles) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { title: 'Study Modes', sub: 'Spaced repetition', icon: Layers, action: () => navigateTo('study'), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 dark:bg-amber-500/20' },
          { title: 'AI Generator', sub: 'Topics or notes', icon: Sparkles, action: () => navigateTo('new-deck'), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 dark:bg-blue-500/20' },
          { title: 'Multiplayer', sub: 'Live trivia battles', icon: Zap, action: () => navigateTo('multiplayer'), color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 dark:bg-rose-500/20' },
          { title: 'Study Hubs', sub: 'Classroom sets', icon: Users, action: () => navigateTo('hubs'), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20' },
        ].map((tile, i) => (
          <Card 
            key={i} 
            onClick={tile.action}
            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${tile.bg} ${tile.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <tile.icon size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-umber dark:text-zinc-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {tile.title}
                </h4>
                <p className="text-[11px] text-taupe dark:text-zinc-500 truncate">
                  {tile.sub}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { title: 'Global Mastery', icon: Brain, val: `${globalMastery}%`, sub: 'Avg. confidence rating across reviews', color: 'text-emerald-600 dark:text-emerald-500' },
          { title: 'Study Momentum', icon: Zap, val: `${activeDays} Days`, sub: 'Active days studied this month', color: 'text-amber-600 dark:text-amber-500' },
          { title: 'Cards Conquered', icon: Target, val: `${cardsConquered}`, sub: 'Confident cards rated or answered', color: 'text-umber dark:text-zinc-100' },
          { title: 'Zero AI Chats', icon: MessageSquare, val: `${aiInteractions}`, sub: 'Tutor explanations & mnemonic queries', color: 'text-blue-600 dark:text-blue-400' },
        ].map((stat, i) => (
          <Card key={i} className="hover:-translate-y-0.5 transition-all rounded-2xl cursor-default shadow-2xs hover:shadow-md border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center gap-2 text-taupe dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4">
                <stat.icon size={16} className={stat.color} /> {stat.title}
              </div>
              <div>
                <p className="text-3xl font-extrabold text-umber dark:text-zinc-100 mb-1">{stat.val}</p>
                <p className="text-xs font-medium text-taupe dark:text-zinc-500 leading-snug">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Decks Section (Direct 1-click access to decks) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-umber dark:text-zinc-100 tracking-tight">
              Your Recent Decks
            </h3>
            <p className="text-xs text-taupe dark:text-zinc-400">
              Pick up where you left off or launch a quick flashcard session.
            </p>
          </div>
          <button 
            onClick={() => navigateTo('decks')} 
            className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>View All ({myDecks.length})</span>
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentDecks.map((deck) => (
            <Card 
              key={deck.id}
              onClick={() => handleOpenDeckDetails(deck)}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between shadow-2xs min-h-[175px]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 rounded-md text-[10px] font-bold uppercase tracking-wider border-none">
                    {deck.cards?.length || 0} Cards
                  </Badge>
                  <span className="text-[11px] text-stone-400 dark:text-zinc-500 font-medium">
                    {deck.visibility || 'Private'}
                  </span>
                </div>
                <h4 className="font-bold text-base text-umber dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
                  {deck.title}
                </h4>
                <p className="text-xs text-taupe dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {deck.description || `${deck.cards?.length || 0} flashcards ready for active recall.`}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-stone-100 dark:border-zinc-800/80 mt-4">
                <Button 
                  size="sm" 
                  onClick={(e) => handleStudyDeck(e, deck)}
                  className="flex-1 h-9 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Play size={13} fill="currentColor" /> Study
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); handleOpenDeckDetails(deck); }}
                  className="h-9 px-3 rounded-xl font-semibold text-xs border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
                >
                  Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
