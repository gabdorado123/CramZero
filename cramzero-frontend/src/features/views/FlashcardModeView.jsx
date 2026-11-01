import { useState, useEffect, useRef } from 'react';
import {
  Clock, Shuffle, Maximize, Minimize, RotateCcw, Check, Sparkles, ArrowLeft,
  ChevronLeft, ChevronRight, RotateCw, Layers, Award, Keyboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { recordAnalyticsEvent } from '@/lib/analytics';

export function FlashcardModeView({ navigateTo, activeDeck, setIsTutorOpen }) {
  const safeDeck = activeDeck || { title: "Flashcard Deck", cards: [{term: "Loading...", definition: "Please hold."}] };

  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [cardOrder, setCardOrder] = useState(() => [...Array(safeDeck.cards?.length || 1).keys()]);
  const [autoSpeed, setAutoSpeed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  // -------------------------------------------------------------
  // KEYBOARD SHORTCUTS FOR INTUITIVE STUDYING (SPACE, ARROWS, 1-3)
  // -------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isFinished) {
          handleReviewAgain();
        } else {
          setIsFlipped(prev => !prev);
          setProgress(0);
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (!isFinished) handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (!isFinished) handlePrev();
      } else if (isFlipped && !isFinished) {
        if (e.key === '1') {
          e.preventDefault();
          handleRate('hard');
        } else if (e.key === '2') {
          e.preventDefault();
          handleRate('good');
        } else if (e.key === '3') {
          e.preventDefault();
          handleRate('easy');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, isFinished, safeDeck]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(e => console.log(e));
    } else {
      containerRef.current?.requestFullscreen().catch(e => console.log(e));
    }
  };

  const totalCards = safeDeck.cards?.length || 1;
  const progressPercentage = isFinished ? 100 : Math.round(((currentIndex + 1) / totalCards) * 100);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start py-3 sm:py-6 px-3 sm:px-6">
      <div 
        ref={containerRef} 
        className={`w-full max-w-2xl mx-auto flex flex-col items-center animate-in fade-in duration-300 ${
          isFullscreen ? 'h-screen max-w-3xl justify-center bg-[#FBF9F5] dark:bg-zinc-950 p-6 sm:p-10' : ''
        }`}
      >
        
        {/* Controls Toolbar with Deck Title Context */}
        <div className="w-full flex items-center justify-between gap-2 sm:gap-3 mb-3 pb-3 border-b border-stone-200/70 dark:border-zinc-800">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateTo('deck-details')} 
              className="text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-200/60 dark:hover:bg-zinc-800 rounded-xl h-9 w-9 shrink-0 transition-colors"
              title="Return to Deck Details"
            >
              <ArrowLeft size={18}/>
            </Button>

            {/* Deck Title */}
            <span className="font-bold text-sm sm:text-base text-stone-900 dark:text-zinc-100 truncate" title={safeDeck.title}>
              {safeDeck.title}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cycleAutoSpeed} 
              disabled={isFinished} 
              className={`h-8 px-2 sm:px-2.5 text-xs font-semibold rounded-lg border transition-all ${
                autoSpeed > 0 
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-2xs' 
                  : 'border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 bg-white/70 dark:bg-zinc-900/70'
              }`}
              title={autoSpeed > 0 ? `Auto-advancing cards (${autoSpeed}s)` : 'Enable auto speed'}
            >
              <Clock size={13} className="mr-1 text-amber-600 dark:text-amber-400" />
              <span>{autoSpeed > 0 ? `${autoSpeed}s` : 'Auto'}</span>
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleShuffle} 
              className={`h-8 px-2 sm:px-2.5 text-xs font-semibold rounded-lg border transition-all ${
                isShuffled 
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-2xs' 
                  : 'border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 bg-white/70 dark:bg-zinc-900/70'
              }`}
              title={isShuffled ? 'Cards shuffled (Click to restore order)' : 'Shuffle cards'}
            >
              <Shuffle size={13} className="mr-1 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Shuffle</span>
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset} 
              className="h-8 px-2 sm:px-2.5 text-xs font-semibold rounded-lg border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 bg-white/70 dark:bg-zinc-900/70 transition-colors"
              title="Reset progress to beginning"
            >
              <RotateCcw size={13} className="mr-1" />
              <span className="hidden sm:inline">Reset</span>
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFullscreen} 
              className="hidden md:flex h-8 px-2.5 text-xs font-semibold rounded-lg border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 bg-white/70 dark:bg-zinc-900/70 transition-colors"
              title={isFullscreen ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            >
              {isFullscreen ? <Minimize size={13} className="mr-1" /> : <Maximize size={13} className="mr-1" />}
              <span>{isFullscreen ? 'Exit' : 'Focus'}</span>
            </Button>

            <Button 
              onClick={() => setIsTutorOpen(true)} 
              className="h-8 bg-amber-500 hover:bg-amber-600 text-white border-0 text-xs font-bold shadow-2xs rounded-lg px-2.5 sm:px-3 flex items-center gap-1.5 transition-all hover:shadow-xs"
              title="Open AI Tutor"
            >
              <Sparkles size={13} />
              <span>Ask AI</span>
            </Button>
          </div>
        </div>

        {/* Deck Progress Bar Line */}
        <div className="w-full mb-3 sm:mb-4">
          <div className="flex justify-between items-center text-xs font-bold text-stone-500 dark:text-zinc-400 mb-1.5 px-0.5">
            <span className="flex items-center gap-2 tracking-wide font-medium">
              <span className={`w-2 h-2 rounded-full ${isFinished ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
              <span>{isFinished ? 'Session Completed' : `Card ${currentIndex + 1} of ${totalCards}`}</span>
            </span>
            <span className="font-mono text-xs text-stone-700 dark:text-zinc-300 font-bold">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-stone-200/60 dark:bg-zinc-800 h-2 rounded-full overflow-hidden p-0.5 border border-stone-200/80 dark:border-zinc-800">
            <div 
              className={`h-full rounded-full transition-all duration-300 ease-out shadow-xs ${isFinished ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-amber-600'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {isFinished ? (
          /* Finished State Screen */
          <div className="w-full max-w-xl flex flex-col items-center text-center py-6 px-4 animate-in zoom-in-95 fade-in duration-300 my-auto">
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

            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-zinc-100 mb-2 tracking-tight">
              Deck Completed!
            </h2>
            <p className="text-stone-500 dark:text-zinc-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              You've reviewed all <span className="font-bold text-stone-900 dark:text-zinc-200">{totalCards} flashcards</span> in this deck. Review again to strengthen your recall or return to your decks.
            </p>

            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 p-4 rounded-2xl text-center shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-1">Cards Mastered</p>
                <p className="text-2xl font-black text-stone-900 dark:text-zinc-100">{totalCards}</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 p-4 rounded-2xl text-center shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-1">Completion</p>
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
                className="flex-1 h-12 rounded-full font-bold bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-stone-800 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 shadow-2xs flex items-center justify-center gap-2"
              >
                <Layers size={16} /> Back to Library
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
                className="text-xs font-semibold text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5"
              >
                Return to Deck Overview
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 3D Flashcard Flipper */}
            <div className="card-scene w-full h-[clamp(260px,40vh,380px)] shrink-0 cursor-pointer select-none" onClick={() => { setIsFlipped(!isFlipped); setProgress(0); }}>
              <div className={`card-flipper ${isFlipped ? 'is-flipped' : ''}`}>
                
                {/* Front Face */}
                <div className="card-face card-front group bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 p-6 md:p-8 text-center rounded-3xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden relative">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-stone-400 dark:text-zinc-500 tracking-widest uppercase">
                      Term
                    </span>
                    <span className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500">
                      {currentIndex + 1} / {totalCards}
                    </span>
                  </div>

                  <div className="my-auto px-2 sm:px-6 w-full">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 dark:text-zinc-100 leading-relaxed overflow-y-auto max-h-[170px] sm:max-h-[220px] no-scrollbar">
                      {currentCard?.term}
                    </h3>
                  </div>
                  
                  {/* Inside Below Card: Auto-flip countdown or click prompt */}
                  <div className="w-full self-center">
                    {autoSpeed > 0 ? (
                      <div className="w-full max-w-xs mx-auto">
                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1 px-0.5">
                          <span className="flex items-center gap-1.5">
                            <RotateCw size={11} className="animate-spin text-amber-600" />
                            Flipping to definition...
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
                      <Badge variant="outline" className="text-xs font-medium text-stone-500 dark:text-zinc-400 border-stone-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-800/60 rounded-full px-3.5 py-1 transition-colors group-hover:bg-amber-50 group-hover:text-amber-800 group-hover:border-amber-200 dark:group-hover:bg-amber-950/40 dark:group-hover:text-amber-300">
                        Click or press Space to reveal definition
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Back Face */}
                <div className="card-face card-back group bg-[#FFFDF9] dark:bg-zinc-900 border border-amber-300/60 dark:border-amber-900/40 p-6 md:p-8 text-center rounded-3xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden relative">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-500 tracking-widest uppercase">
                      Definition
                    </span>
                    <span className="text-[11px] font-semibold text-amber-700/60 dark:text-amber-500/60">
                      {currentIndex + 1} / {totalCards}
                    </span>
                  </div>

                  <div className="my-auto px-2 sm:px-6 w-full">
                    <h3 className="text-base sm:text-lg md:text-xl font-medium text-stone-800 dark:text-zinc-200 leading-relaxed overflow-y-auto max-h-[170px] sm:max-h-[220px] no-scrollbar">
                      {currentCard?.definition}
                    </h3>
                  </div>
                  
                  {/* Inside Below Card: Auto-flip countdown or click prompt */}
                  <div className="w-full self-center">
                    {autoSpeed > 0 ? (
                      <div className="w-full max-w-xs mx-auto">
                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1 px-0.5">
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
                      <Badge variant="outline" className="text-xs font-medium text-stone-500 dark:text-zinc-400 border-stone-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-800/60 rounded-full px-3.5 py-1 transition-colors group-hover:bg-amber-50 group-hover:text-amber-800 group-hover:border-amber-200 dark:group-hover:bg-amber-950/40 dark:group-hover:text-amber-300">
                        Click or press Space to flip back
                      </Badge>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Actions / Navigation Controls */}
            <div className="h-14 mt-4 flex items-center justify-center w-full max-w-xl shrink-0">
              {!isFlipped ? (
                <div className="flex items-center gap-4 sm:gap-6">
                  <button 
                    onClick={handlePrev} 
                    disabled={currentIndex === 0} 
                    aria-label="Previous card"
                    className="w-11 h-11 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-800 dark:text-zinc-100 shadow-2xs hover:shadow-md hover:bg-stone-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none hover:scale-105 active:scale-95"
                    title="Previous Card (← Arrow)"
                  >
                    <ChevronLeft size={22}/>
                  </button>
                  <span className="text-xs font-bold text-stone-500 dark:text-zinc-400 min-w-20 text-center tracking-wide">
                    {currentIndex + 1} of {totalCards}
                  </span>
                  {currentIndex === totalCards - 1 ? (
                    <button 
                      onClick={handleNext} 
                      aria-label="Finish review"
                      title="Finish review"
                      className="h-11 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-2xs hover:shadow-md transition-all hover:scale-105 active:scale-95"
                    >
                      <span>Finish</span>
                      <Check size={16} strokeWidth={2.5} />
                    </button>
                  ) : (
                    <button 
                      onClick={handleNext} 
                      aria-label="Next card"
                      className="w-11 h-11 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-800 dark:text-zinc-100 shadow-2xs hover:shadow-md hover:bg-stone-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none hover:scale-105 active:scale-95"
                      title="Next Card (→ Arrow)"
                    >
                      <ChevronRight size={22}/>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3 w-full animate-in slide-in-from-bottom-2 duration-200">
                  <Button 
                    onClick={() => handleRate('hard')} 
                    className="flex-1 h-11 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl font-bold shadow-2xs transition-all hover:scale-102 active:scale-98"
                    title="Press 1"
                  >
                    Hard <kbd className="ml-1 px-1 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900/80 text-[10px] font-mono">1</kbd>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleRate('good')} 
                    className="flex-1 h-11 bg-stone-50 hover:bg-stone-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-stone-800 dark:text-zinc-200 border-stone-200 dark:border-zinc-800 rounded-xl font-bold shadow-2xs transition-all hover:scale-102 active:scale-98"
                    title="Press 2"
                  >
                    Good <kbd className="ml-1 px-1 py-0.5 rounded bg-stone-200 dark:bg-zinc-800 text-[10px] font-mono">2</kbd>
                  </Button>
                  <Button 
                    onClick={() => handleRate('easy')} 
                    className="flex-1 h-11 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-xl font-bold shadow-2xs transition-all hover:scale-102 active:scale-98"
                    title="Press 3"
                  >
                    Easy <kbd className="ml-1 px-1 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/80 text-[10px] font-mono">3</kbd>
                  </Button>
                </div>
              )}
            </div>

            {/* Desktop Keyboard Shortcuts Helper */}
            <div className="hidden sm:flex items-center justify-center gap-4 text-[11px] font-medium text-stone-500 dark:text-zinc-500 mt-3 pt-2">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 font-mono text-[10px] text-stone-700 dark:text-zinc-300">Space</kbd>
                Flip
              </span>
              <span className="text-stone-300 dark:text-zinc-700">•</span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 font-mono text-[10px] text-stone-700 dark:text-zinc-300">← / →</kbd>
                Prev / Next
              </span>
              <span className="text-stone-300 dark:text-zinc-700">•</span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 font-mono text-[10px] text-stone-700 dark:text-zinc-300">1, 2, 3</kbd>
                Rate difficulty
              </span>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
