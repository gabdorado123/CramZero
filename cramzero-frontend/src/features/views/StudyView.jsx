import { useState, useEffect } from 'react';
import {
  BookOpen, CheckCircle, Play, Layers, ArrowRight,
  TrendingUp, Check, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export function StudyView({ navigateTo, setHasActiveDeck, setActiveDeck, myDecks }) {
  const [activeTab, setActiveTab] = useState('Review');
  const [enrolledIds, setEnrolledIds] = useState([]);

  useEffect(() => {
    if (myDecks.length > 0 && enrolledIds.length === 0) {
      setEnrolledIds(myDecks.map(d => d.id));
    }
  }, [myDecks]);

  const toggleEnrollment = (id) => {
    setEnrolledIds(prev => prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]);
  };

  const selectAllDecks = () => setEnrolledIds(myDecks.map(deck => deck.id));
  const clearAllDecks = () => setEnrolledIds([]);

  const startCombinedSession = (mode) => {
    const decksToCombine = activeTab === 'Review' ? myDecks.filter(d => enrolledIds.includes(d.id)) : myDecks;
    const combinedCards = decksToCombine.flatMap(d => d.cards || []);
    
    if (combinedCards.length === 0) {
      toast.error("No cards available to study.");
      return;
    }

    const combinedDeck = {
      id: 'combined-session',
      title: activeTab === 'Review' ? "Daily Spaced Repetition" : "Master Deck (All)",
      cards: combinedCards,
      visibility: "Private",
      created_at: new Date().toISOString()
    };
    setActiveDeck(combinedDeck);
    setHasActiveDeck(true);
    navigateTo(mode);
  };

  if (myDecks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto p-4 sm:p-6 text-center my-auto">
        <Card className="w-full p-8 sm:p-12 text-center border-dashed border-stone-300 dark:border-zinc-800 shadow-none bg-white/50 dark:bg-zinc-900/50 rounded-3xl">
          <div className="w-16 h-16 bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Layers size={32} />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold mb-2 text-stone-900 dark:text-zinc-100">
            Nothing to study yet
          </CardTitle>
          <CardDescription className="text-sm sm:text-base mb-6 text-stone-500 dark:text-zinc-400 max-w-sm mx-auto">
            Your library is empty. Create or import a flashcard deck before starting a study session.
          </CardDescription>
          <Button 
            onClick={() => navigateTo('new-deck')} 
            className="bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-stone-800 dark:hover:bg-zinc-200 font-bold rounded-full h-12 px-8 shadow-sm"
          >
            Create Your First Deck
          </Button>
        </Card>
      </div>
    );
  }

  const enrolledDecks = myDecks.filter(deck => enrolledIds.includes(deck.id));
  const dueCount = enrolledDecks.reduce((total, deck) => total + (deck.cards?.length || 0), 0);
  const totalCards = myDecks.reduce((total, deck) => total + (deck.cards?.length || 0), 0);
  const enrolledCardCount = enrolledDecks.reduce((total, deck) => total + (deck.cards?.length || 0), 0);
  const enrollmentPercent = totalCards === 0 ? 0 : Math.round((enrolledCardCount / totalCards) * 100);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-6 md:space-y-8 animate-in fade-in duration-200">
      
      {/* Top Segmented Tabs Bar (Fits device cleanly) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/50 dark:bg-zinc-900/90 rounded-2xl border border-stone-200/80 dark:border-zinc-800/80 w-fit max-w-full overflow-x-auto no-scrollbar">
          {[
            { id: 'Review', label: 'Spaced Repetition', sub: 'Smart Daily Review' },
            { id: 'Quiz', label: 'Knowledge Check', sub: 'Interactive Quiz' },
            { id: 'Flashcards', label: 'Deep Dive', sub: 'Flashcard Review' },
          ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap active:scale-95 select-none ${
              activeTab === tab.id 
                ? 'bg-white text-stone-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100 font-bold' 
                : 'text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
        </div>
        <p className="text-xs text-taupe dark:text-zinc-400 font-medium hidden md:block">
          {activeTab === 'Review' && 'Prioritizes cards you find challenging with spaced intervals.'}
          {activeTab === 'Quiz' && 'Tests comprehension with multiple-choice questions.'}
          {activeTab === 'Flashcards' && 'Classic 3D card flipping for comprehensive memorization.'}
        </p>
      </div>

      <div key={activeTab} className="animate-in fade-in duration-200">
        
        {/* TAB 1: SPACED REPETITION */}
        {activeTab === 'Review' && (
          <div className="space-y-6 md:space-y-8">
            
            {/* Hero Progress Banners */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <Card data-tour="study-review" className="lg:col-span-8 p-6 sm:p-8 bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 rounded-3xl shadow-xl flex flex-col justify-between border-none">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-zinc-500">Today's review</p>
                    <h3 className="text-3xl sm:text-4xl font-black mt-1 tracking-tight">{dueCount} Cards</h3>
                  </div>
                  <Badge className="bg-white/15 text-stone-100 border-white/20 dark:bg-zinc-900/15 dark:text-zinc-900 dark:border-zinc-900/20 font-bold px-3 py-1 text-xs rounded-full">
                    {enrolledDecks.length} {enrolledDecks.length === 1 ? 'deck' : 'decks'}
                  </Badge>
                </div>

                <p className="text-stone-300 dark:text-zinc-600 font-medium text-sm sm:text-base mb-6 leading-relaxed">
                  Review only the decks you include below. You can customize this selection anytime to target specific subjects.
                </p>

                <div>
                  <Button 
                    onClick={() => startCombinedSession('flashcard-mode')} 
                    disabled={dueCount === 0} 
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold px-7 h-12 rounded-xl shadow-md border-none transition-all flex items-center justify-center gap-2"
                  >
                    Start Daily Review <Play size={16} fill="currentColor"/>
                  </Button>
                </div>
              </Card>

              <Card className="lg:col-span-4 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 flex flex-col justify-center shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                    <TrendingUp size={24}/>
                  </div>
                  <span className="text-3xl font-black text-stone-900 dark:text-zinc-100">{enrollmentPercent}%</span>
                </div>
                <h4 className="font-bold text-base sm:text-lg text-stone-900 dark:text-zinc-100">Library included</h4>
                <div className="h-2.5 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${enrollmentPercent}%` }} />
                </div>
                <p className="text-xs text-stone-500 dark:text-zinc-400 mt-2.5 font-medium">{enrolledCardCount} of {totalCards} cards selected</p>
              </Card>
            </div>

            {/* Decks Selection Header */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Choose your review set</h3>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-0.5">Toggle decks to include or exclude from today's spaced repetition session.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={selectAllDecks} 
                    disabled={enrolledIds.length === myDecks.length} 
                    className="h-8 rounded-lg border-stone-200 dark:border-zinc-700 px-3 text-xs font-bold text-stone-700 dark:text-zinc-300"
                  >
                    Select all
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllDecks} 
                    disabled={enrolledIds.length === 0} 
                    className="h-8 rounded-lg px-3 text-xs font-bold text-stone-500 dark:text-zinc-400"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* 2-Column Responsive Deck Grid (Fits tablet & desktop width naturally) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {myDecks.map(deck => {
                  const isEnrolled = enrolledIds.includes(deck.id);
                  return (
                    <Card 
                      key={deck.id} 
                      onClick={() => toggleEnrollment(deck.id)}
                      className={`cursor-pointer shadow-xs hover:shadow-sm bg-white/95 dark:bg-zinc-900/95 transition-all rounded-2xl border ${
                        isEnrolled 
                          ? 'border-emerald-500/60 dark:border-emerald-500/60 ring-1 ring-emerald-500/20' 
                          : 'border-stone-200/80 dark:border-zinc-800'
                      }`}
                    >
                      <CardContent className="flex items-center justify-between gap-3 p-4 sm:p-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            isEnrolled 
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' 
                              : 'bg-stone-100 text-stone-400 dark:bg-zinc-800 dark:text-zinc-500'
                          }`}>
                            {isEnrolled ? <Check size={18} strokeWidth={2.5} /> : <Layers size={18} />}
                          </div>
                          <div className="min-w-0">
                            <span className="block truncate font-bold text-sm sm:text-base text-stone-900 dark:text-zinc-100">{deck.title}</span>
                            <span className="text-xs text-stone-500 dark:text-zinc-400">{deck.cards?.length || 0} cards · {isEnrolled ? 'Included in review' : 'Not included'}</span>
                          </div>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Switch 
                            aria-label={`${isEnrolled ? 'Remove' : 'Add'} ${deck.title} ${isEnrolled ? 'from' : 'to'} spaced repetition`} 
                            checked={isEnrolled} 
                            onCheckedChange={() => toggleEnrollment(deck.id)} 
                            className="data-[state=checked]:bg-emerald-500 shrink-0" 
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KNOWLEDGE CHECK (QUIZ) */}
        {activeTab === 'Quiz' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-2 border-b border-stone-200/60 dark:border-zinc-800/80">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight">Knowledge Check</h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-0.5">Select a deck to configure your multiple-choice or true/false assessment.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {myDecks.map(deck => (
                <Card 
                  key={deck.id} 
                  onClick={() => { setActiveDeck(deck); navigateTo('quiz-setup'); }} 
                  className="cursor-pointer hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all p-5 sm:p-6 shadow-xs border-stone-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 rounded-3xl group flex flex-col justify-between min-h-[160px]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                        <CheckCircle size={20}/>
                      </div>
                      <Badge variant="secondary" className="bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-bold border-none text-xs rounded-full">
                        {deck.cards?.length || 0} Qs
                      </Badge>
                    </div>
                    <h4 className="font-bold text-base sm:text-lg text-stone-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {deck.title}
                    </h4>
                  </div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-4 flex items-center gap-1">
                    Configure Quiz <ArrowRight size={13}/>
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DEEP DIVE (FLASHCARDS) */}
        {activeTab === 'Flashcards' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2 border-b border-stone-200/60 dark:border-zinc-800/80">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight">Deep Dive</h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-0.5">Master individual topics or combine your entire library into one master stack.</p>
              </div>
              <Button 
                onClick={() => startCombinedSession('flashcard-mode')} 
                className="bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-stone-800 dark:hover:bg-zinc-200 rounded-full font-bold h-11 px-6 shadow-sm w-full sm:w-auto flex items-center justify-center gap-2 shrink-0"
              >
                <Layers size={16} /> Combine All Decks
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {myDecks.map(deck => (
                <Card 
                  key={deck.id} 
                  onClick={() => { setActiveDeck(deck); navigateTo('flashcard-mode'); }} 
                  className="cursor-pointer hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all p-5 sm:p-6 shadow-xs border-stone-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 rounded-3xl group flex flex-col justify-between min-h-[160px]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                        <BookOpen size={20}/>
                      </div>
                      <Badge variant="outline" className="text-stone-500 dark:text-zinc-400 border-stone-200 dark:border-zinc-700 font-bold text-xs rounded-full">
                        {deck.cards?.length || 0} Cards
                      </Badge>
                    </div>
                    <h4 className="font-bold text-base sm:text-lg text-stone-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {deck.title}
                    </h4>
                  </div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-4 flex items-center gap-1">
                    Start Flashcards <ArrowRight size={13}/>
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
