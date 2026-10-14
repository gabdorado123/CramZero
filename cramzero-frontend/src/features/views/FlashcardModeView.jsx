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
  const [isFinished, setIsFinished] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (autoSpeed === 0) { setProgress(0); return; }
    const updateInterval = 50;
    const increment = (updateInterval / (autoSpeed * 1000)) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (!isFlipped) { 
            setIsFlipped(true); 
            return 0; 
          } else if (currentIndex < (safeDeck.cards?.length || 1) - 1) { 
            setIsFlipped(false); 
            setCurrentIndex(idx => idx + 1); 
            return 0; 
          } else { 
            setAutoSpeed(0); 
            setIsFinished(true);
            return 0; 
          }
        }
        return prev + increment;
      });
    }, updateInterval);
    return () => clearInterval(timer);
  }, [autoSpeed, isFlipped, currentIndex, safeDeck]);

  const currentCard = safeDeck.cards ? safeDeck.cards[cardOrder[currentIndex]] : {term: "Empty", definition: "Empty"};
  const cycleAutoSpeed = () => { setAutoSpeed(prev => prev === 0 ? 3 : prev === 3 ? 5 : prev === 5 ? 10 : 0); setProgress(0); };
  
  const handleNext = () => { 
    setIsFlipped(false); 
    setProgress(0); 
    if (currentIndex < (safeDeck.cards?.length || 1) - 1) {
      setCurrentIndex(prev => prev + 1); 
    } else {
      setAutoSpeed(0);
      setIsFinished(true);
    }
  };

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

  const handlePrev = () => { 
    setIsFlipped(false); 
    setProgress(0); 
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1); 
  };

  const toggleShuffle = () => {
    if (!isShuffled) setCardOrder([...cardOrder].sort(() => Math.random() - 0.5));
    else setCardOrder([...Array(safeDeck.cards?.length || 1).keys()]);
    setIsShuffled(!isShuffled); 
    setCurrentIndex(0); 
    setIsFlipped(false); 
    setProgress(0);
    setIsFinished(false);
  };

  const handleReset = () => { 
    setCurrentIndex(0); 
    setIsFlipped(false); 
    setAutoSpeed(0); 
    setProgress(0); 
    setIsFinished(false);
    setCardOrder([...Array(safeDeck.cards?.length || 1).keys()]); 
    setIsShuffled(false); 
  };

  const handleReviewAgain = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setAutoSpeed(0);
    setProgress(0);
    setIsFinished(false);
  };

  const toggleFullscreen = () => document.fullscreenElement ? document.exitFullscreen() : containerRef.current?.requestFullscreen().catch(e => console.log(e));

  const totalCards = safeDeck.cards?.length || 1;
  const progressPercentage = isFinished ? 100 : Math.round(((currentIndex + 1) / totalCards) * 100);

  return (
    <div className="min-h-full flex-1 w-full flex flex-col items-center justify-center p-4 md:p-8">
      <div ref={containerRef} className="max-w-3xl w-full mx-auto my-auto flex flex-col items-center animate-in fade-in duration-300 bg-white dark:bg-zinc-950 p-5 md:p-8 rounded-3xl border border-stone-200/90 dark:border-zinc-800 shadow-sm">
        
        {/* Controls Toolbar */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-stone-200/60 dark:border-zinc-800/80 pb-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigateTo('deck-details')} className="text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl h-9 w-9">
              <ArrowLeft size={18}/>
            </Button>
            <div className="flex flex-wrap gap-1.5 sm:border-r sm:border-stone-200 dark:sm:border-zinc-800 sm:pr-3">
              <Button variant="outline" size="sm" onClick={cycleAutoSpeed} disabled={isFinished} className={`h-8 text-xs font-bold rounded-lg border transition-all ${autoSpeed > 0 ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-xs' : 'border-stone-200 dark:border-zinc-800 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 bg-transparent'}`}>
                <Clock size={13} className="mr-1.5 text-amber-600" /> {autoSpeed > 0 ? `${autoSpeed}s` : 'Auto'}
              </Button>
              <Button variant="outline" size="sm" onClick={toggleShuffle} className={`h-8 text-xs font-bold rounded-lg border transition-all ${isShuffled ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-xs' : 'border-stone-200 dark:border-zinc-800 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 bg-transparent'}`}>
                <Shuffle size={13} className="mr-1.5 text-amber-600" /> Shuffle
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-xs font-bold rounded-lg border-stone-200 dark:border-zinc-800 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 bg-transparent">
                <RotateCcw size={13} className="mr-1.5" /> Reset
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullscreen} className="hidden md:flex h-8 text-xs font-bold rounded-lg border-stone-200 dark:border-zinc-800 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 bg-transparent">
                <Maximize size={13} className="mr-1.5" /> Focus
              </Button>
            </div>
            <Badge variant="secondary" className="font-bold tracking-wide rounded-lg text-xs bg-stone-100 dark:bg-zinc-800 text-umber dark:text-zinc-200 border border-stone-200/50 dark:border-zinc-700/50 px-2.5 py-1">
              {isFinished ? `Completed (${totalCards}/${totalCards})` : `Card ${currentIndex + 1} / ${totalCards}`}
            </Badge>
          </div>
          <div>
            <Button onClick={() => setIsTutorOpen(true)} className="h-8.5 bg-amber-500 hover:bg-amber-600 text-white border-0 text-xs font-bold shadow-xs rounded-xl px-3.5 flex items-center gap-1.5 transition-all hover:shadow-md">
              <Sparkles size={14} /> Ask AI
            </Button>
          </div>
        </div>

        {/* Deck Progress Bar Line */}
        <div className="w-full mb-6">
          <div className="flex justify-between items-center text-[11px] font-bold text-taupe dark:text-zinc-400 mb-1.5 px-0.5">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <span className={`w-2 h-2 rounded-full ${isFinished ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
              Deck Progress
            </span>
            <span className="font-mono text-umber dark:text-zinc-200">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-zinc-900 h-2 rounded-full overflow-hidden p-0.5 border border-stone-200/60 dark:border-zinc-800">
            <div 
              className={`h-full rounded-full transition-all duration-300 ease-out shadow-xs ${isFinished ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-amber-600'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {isFinished ? (
          /* Finished State Screen */
          <div className="w-full max-w-xl flex flex-col items-center text-center py-6 px-4 animate-in zoom-in-95 fade-in duration-300">
            <div className="relative mb-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-300/40 dark:border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Award size={44} className="animate-bounce" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <Check size={16} strokeWidth={3} />
              </div>
            </div>

            <Badge className="bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800 font-bold px-3 py-1 rounded-full text-xs mb-3">
              Session Completed
            </Badge>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-umber dark:text-zinc-100 mb-2 tracking-tight">
              Deck Completed!
            </h2>
            <p className="text-taupe dark:text-zinc-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              You've reviewed all <span className="font-bold text-umber dark:text-zinc-200">{totalCards} flashcards</span> in this deck. Review again to strengthen your recall or return to your decks.
            </p>

            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              <div className="bg-stone-50 dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 p-4 rounded-2xl text-center shadow-2xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-taupe dark:text-zinc-500 mb-1">Cards Mastered</p>
                <p className="text-2xl font-black text-umber dark:text-zinc-100">{totalCards}</p>
              </div>
              <div className="bg-stone-50 dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 p-4 rounded-2xl text-center shadow-2xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-taupe dark:text-zinc-500 mb-1">Completion</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</p>
              </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleReviewAgain}
                className="flex-1 h-12 rounded-full font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} /> Review from Start
              </Button>
              <Button 
                onClick={() => navigateTo('decks')}
                variant="outline"
                className="flex-1 h-12 rounded-full font-bold bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-umber dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 shadow-2xs flex items-center justify-center gap-2"
              >
                <Layers size={16} /> Back to Decks
              </Button>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <button 
                onClick={toggleShuffle}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1.5"
              >
                <Shuffle size={13} /> Shuffle & Restart
              </button>
              <span className="text-stone-300 dark:text-zinc-700">•</span>
              <button 
                onClick={() => navigateTo('deck-details')}
                className="text-xs font-semibold text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5"
              >
                Return to Deck Overview
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Flashcard Flipper */}
            <div className="card-scene w-full max-w-xl h-[clamp(280px,46vh,420px)] shrink-0 cursor-pointer select-none" onClick={() => { setIsFlipped(!isFlipped); setProgress(0); }}>
              <div className={`card-flipper ${isFlipped ? 'is-flipped' : ''}`}>
                <div className="card-face card-front group bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 p-6 md:p-8 text-center rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative">
                  <span className="self-start text-[11px] font-extrabold text-taupe dark:text-zinc-500 tracking-widest uppercase">
                    Term
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-umber dark:text-zinc-100 px-4 leading-relaxed my-auto">
                    {currentCard?.term}
                  </h3>
                  
                  {/* Inside Below Card: Auto-flip countdown or click prompt */}
                  <div className="w-full self-center">
                    {autoSpeed > 0 ? (
                      <div className="w-full pt-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1.5 px-0.5">
                          <span className="flex items-center gap-1.5">
                            <RotateCw size={11} className="animate-spin text-amber-600" />
                            Auto-flipping definition...
                          </span>
                          <span className="font-mono text-[11px]">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-amber-200/40 dark:border-amber-900/40">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-75 ease-linear"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs font-semibold text-taupe dark:text-zinc-400 border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 rounded-full px-3 py-1">
                        Click to flip definition
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="card-face card-back group bg-[#FAF7F2] dark:bg-zinc-900 border border-amber-200/80 dark:border-amber-900/40 p-6 md:p-8 text-center rounded-3xl shadow-sm flex flex-col justify-between overflow-hidden relative">
                  <span className="self-start text-[11px] font-extrabold text-amber-700 dark:text-amber-500 tracking-widest uppercase">
                    Definition
                  </span>
                  <h3 className="text-xl md:text-2xl font-medium text-umber dark:text-zinc-200 px-4 leading-relaxed my-auto">
                    {currentCard?.definition}
                  </h3>
                  
                  {/* Inside Below Card: Auto-flip countdown or click prompt */}
                  <div className="w-full self-center">
                    {autoSpeed > 0 ? (
                      <div className="w-full pt-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1.5 px-0.5">
                          <span className="flex items-center gap-1.5">
                            <RotateCw size={11} className="animate-spin text-amber-600" />
                            Next card in...
                          </span>
                          <span className="font-mono text-[11px]">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-amber-100/60 dark:bg-zinc-800 rounded-full overflow-hidden border border-amber-300/40 dark:border-amber-800/40">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-75 ease-linear"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs font-semibold text-taupe dark:text-zinc-400 border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-800/50 rounded-full px-3 py-1">
                        Click to flip back
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions / Navigation Controls */}
            <div className="h-16 mt-6 flex items-center justify-center w-full max-w-xl shrink-0">
              {!isFlipped ? (
                <div className="flex items-center gap-5 sm:gap-6">
                  <button 
                    onClick={handlePrev} 
                    disabled={currentIndex === 0} 
                    aria-label="Previous card"
                    className="w-12 h-12 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-umber dark:text-zinc-100 shadow-xs hover:shadow-md hover:bg-stone-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none hover:scale-105 active:scale-95"
                  >
                    <ChevronLeft size={24}/>
                  </button>
                  <span className="text-xs font-bold text-taupe dark:text-zinc-500 min-w-16 text-center">
                    {currentIndex + 1} of {totalCards}
                  </span>
                  {currentIndex === totalCards - 1 ? (
                    <button 
                      onClick={handleNext} 
                      aria-label="Finish review"
                      title="Finish review"
                      className="h-12 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-2 shadow-xs hover:shadow-md transition-all hover:scale-105 active:scale-95"
                    >
                      <span>Finish</span>
                      <Check size={18} strokeWidth={2.5} />
                    </button>
                  ) : (
                    <button 
                      onClick={handleNext} 
                      aria-label="Next card"
                      className="w-12 h-12 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-umber dark:text-zinc-100 shadow-xs hover:shadow-md hover:bg-stone-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none hover:scale-105 active:scale-95"
                    >
                      <ChevronRight size={24}/>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2 md:gap-3 w-full animate-in slide-in-from-bottom-2 duration-200">
                  <Button onClick={() => handleRate('hard')} className="flex-1 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 shadow-xs">
                    Hard (1m)
                  </Button>
                  <Button variant="outline" onClick={() => handleRate('good')} className="flex-1 h-12 rounded-xl font-bold bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-umber dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 shadow-xs">
                    Good (10m)
                  </Button>
                  <Button onClick={() => handleRate('easy')} className="flex-1 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-xl font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 shadow-xs">
                    Easy (4d)
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTIVE ASSESSMENT ENGINE (DYNAMIC QUIZ & MOCK EXAM VIEW)
// ---------------------------------------------------------------------------
