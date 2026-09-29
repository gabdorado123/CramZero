import { useState, useEffect, useRef } from 'react';
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
import { recordAnalyticsEvent } from '@/lib/analytics';

export function FlashcardModeView({ navigateTo, activeDeck, setIsTutorOpen }) {
  const safeDeck = activeDeck || { cards: [{term: "Loading...", definition: "Please hold."}] };

  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [cardOrder, setCardOrder] = useState(() => [...Array(safeDeck.cards?.length || 1).keys()]);
  const [autoSpeed, setAutoSpeed] = useState(0);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (autoSpeed === 0) { setProgress(0); return; }
    const updateInterval = 50;
    const increment = (updateInterval / (autoSpeed * 1000)) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (!isFlipped) { setIsFlipped(true); return 0; }
          else if (currentIndex < (safeDeck.cards?.length || 1) - 1) { setIsFlipped(false); setCurrentIndex(idx => idx + 1); return 0; }
          else { setAutoSpeed(0); return 0; }
        }
        return prev + increment;
      });
    }, updateInterval);
    return () => clearInterval(timer);
  }, [autoSpeed, isFlipped, currentIndex, safeDeck]);

  const currentCard = safeDeck.cards ? safeDeck.cards[cardOrder[currentIndex]] : {term: "Empty", definition: "Empty"};
  const cycleAutoSpeed = () => { setAutoSpeed(prev => prev === 0 ? 3 : prev === 3 ? 5 : prev === 5 ? 10 : 0); setProgress(0); };
  const handleNext = () => { setIsFlipped(false); setProgress(0); if (currentIndex < (safeDeck.cards?.length || 1) - 1) setCurrentIndex(prev => prev + 1); };
  const handleRate = (rating) => {
    recordAnalyticsEvent({
      type: 'flashcard_rating',
      deckId: safeDeck.id || 'unknown-deck',
      deckTitle: safeDeck.title || 'Untitled deck',
      cardId: currentCard.id || currentCard.term,
      term: currentCard.term,
      rating,
    });
    handleNext();
  };
  const handlePrev = () => { setIsFlipped(false); setProgress(0); if (currentIndex > 0) setCurrentIndex(prev => prev - 1); };
  const toggleShuffle = () => {
    if (!isShuffled) setCardOrder([...cardOrder].sort(() => Math.random() - 0.5));
    else setCardOrder([...Array(safeDeck.cards?.length || 1).keys()]);
    setIsShuffled(!isShuffled); setCurrentIndex(0); setIsFlipped(false); setProgress(0);
  };
  const handleReset = () => { setCurrentIndex(0); setIsFlipped(false); setAutoSpeed(0); setProgress(0); setCardOrder([...Array(safeDeck.cards?.length || 1).keys()]); setIsShuffled(false); };
  const toggleFullscreen = () => document.fullscreenElement ? document.exitFullscreen() : containerRef.current?.requestFullscreen().catch(e => console.log(e));

  return (
    <div ref={containerRef} className="max-w-4xl w-full mx-auto flex flex-col items-center animate-in fade-in duration-300 h-full min-h-[75vh] bg-white dark:bg-zinc-950 p-4 md:p-6 rounded-2xl">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-taupe/20 dark:border-zinc-800 pb-4">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigateTo('deck-details')} className="text-taupe dark:text-zinc-500 hover:text-umber dark:hover:text-zinc-100 hover:bg-greige/20 dark:hover:bg-zinc-800 mr-1"><ArrowLeft size={20}/></Button>
          <div className="flex flex-wrap gap-1.5 sm:border-r sm:border-taupe/20 dark:sm:border-zinc-800 sm:pr-4">
            <Button variant="outline" size="sm" onClick={cycleAutoSpeed} className={`h-8 text-[11px] font-bold uppercase tracking-wider border-taupe/30 dark:border-zinc-700 ${autoSpeed > 0 ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50' : 'text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 hover:bg-greige/20 dark:hover:bg-zinc-800 bg-transparent'}`}><Clock size={13} className="mr-1" /> {autoSpeed > 0 ? `${autoSpeed}s` : 'Auto'}</Button>
            <Button variant="outline" size="sm" onClick={toggleShuffle} className={`h-8 text-[11px] font-bold uppercase tracking-wider border-taupe/30 dark:border-zinc-700 ${isShuffled ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50' : 'text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 hover:bg-greige/20 dark:hover:bg-zinc-800 bg-transparent'}`}><Shuffle size={13} className="mr-1" /> Shuffle</Button>
            <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-[11px] font-bold uppercase tracking-wider text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 hover:bg-greige/20 dark:hover:bg-zinc-800 bg-transparent border-taupe/30 dark:border-zinc-700"><RotateCcw size={13} className="mr-1" /> Reset</Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen} className="hidden md:flex h-8 text-[11px] font-bold uppercase tracking-wider text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 hover:bg-greige/20 dark:hover:bg-zinc-800 bg-transparent border-taupe/30 dark:border-zinc-700"><Maximize size={13} className="mr-1" /> Focus</Button>
          </div>
          <Badge variant="secondary" className="font-bold tracking-wide rounded-lg text-xs bg-greige/20 dark:bg-zinc-800 text-umber dark:text-zinc-300 hover:bg-greige/20 dark:hover:bg-zinc-800 border-none">Card {currentIndex + 1} / {safeDeck.cards?.length || 0}</Badge>
        </div>
        <div>
          <Button onClick={() => setIsTutorOpen(true)} className="h-8 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-800 text-xs font-bold shadow-sm rounded-lg"><HelpCircle size={15} className="mr-1.5" /> Ask AI</Button>
        </div>
      </div>
      
      <div className="card-scene w-full max-w-2xl flex-1 my-auto min-h-[220px]" onClick={() => { setIsFlipped(!isFlipped); setProgress(0); }}>
        <div className={`card-flipper ${isFlipped ? 'is-flipped' : ''}`}>
          <div className="card-face card-front group bg-white dark:bg-zinc-900 border border-taupe/30 dark:border-zinc-800 p-6 text-center">
            <span className="absolute top-4 left-4 text-[10px] md:text-xs font-bold text-taupe dark:text-zinc-500 tracking-widest uppercase">Term</span>
            <h3 className="text-xl md:text-3xl font-medium text-umber dark:text-zinc-100 px-4 leading-relaxed">{currentCard?.term}</h3>
            {autoSpeed === 0 && <Badge className="absolute bottom-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-sand dark:bg-zinc-800 text-taupe dark:text-zinc-400 hover:bg-sand dark:hover:bg-zinc-800 border-none">Click to flip</Badge>}
          </div>
          <div className="card-face card-back group bg-sand/60 dark:bg-zinc-800 border border-taupe/30 dark:border-zinc-700 p-6 text-center">
            <span className="absolute top-4 left-4 text-[10px] md:text-xs font-bold text-taupe dark:text-zinc-500 tracking-widest uppercase">Definition</span>
            <h3 className="text-lg md:text-2xl font-medium text-umber dark:text-zinc-100 px-4 leading-relaxed">{currentCard?.definition}</h3>
            {autoSpeed === 0 && <Badge className="absolute bottom-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-white/70 dark:bg-zinc-900 text-taupe dark:text-zinc-400 hover:bg-white/70 dark:hover:bg-zinc-900 border-none">Click to flip back</Badge>}
          </div>
        </div>
        {autoSpeed > 0 && <div className="relative -mt-6 z-10 px-6 pb-1 text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-2 pointer-events-none"><RotateCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />{isFlipped ? "Moving to next..." : "Auto-flipping..."}</div>}
      </div>

      <div className="h-20 mt-6 flex items-center justify-center w-full max-w-2xl shrink-0">
        {!isFlipped ? (
          <div className="flex gap-8 md:gap-12 text-taupe dark:text-zinc-500">
            <button onClick={handlePrev} disabled={currentIndex === 0} className="hover:text-umber dark:hover:text-zinc-100 transition-colors disabled:opacity-30"><ChevronLeft size={30}/></button>
            <button onClick={handleNext} disabled={currentIndex === (safeDeck.cards?.length || 1) - 1} className="hover:text-umber dark:hover:text-zinc-100 transition-colors disabled:opacity-30"><ChevronRight size={30}/></button>
          </div>
        ) : (
          <div className="flex gap-2 md:gap-4 w-full animate-in slide-in-from-bottom-2 duration-200">
            <Button onClick={() => handleRate('hard')} className="flex-1 h-12 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl font-bold hover:bg-rose-100 dark:hover:bg-rose-900">Hard (1m)</Button>
            <Button variant="outline" onClick={() => handleRate('good')} className="flex-1 h-12 rounded-xl font-bold bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-700 text-umber dark:text-zinc-300 hover:bg-greige/10 dark:hover:bg-zinc-800 hover:text-umber dark:hover:text-zinc-100">Good (10m)</Button>
            <Button onClick={() => handleRate('easy')} className="flex-1 h-12 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-xl font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900">Easy (4d)</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTIVE ASSESSMENT ENGINE (DYNAMIC QUIZ & MOCK EXAM VIEW)
// ---------------------------------------------------------------------------
