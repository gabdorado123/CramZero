import { useState, useEffect } from 'react';
import {
  Search, Plus, Star, Play, Library, Layers, ArrowRight, X,
  Globe, Download, CheckCircle, RotateCw, User, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';

export function DecksView({ navigateTo, setActiveDeck, myDecks, setMyDecks, userId, displayName }) {
  const [pinnedIds, setPinnedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'created', 'saved', 'community'
  
  // Public community decks state
  const [publicDecks, setPublicDecks] = useState([]);
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  const [savingDeckId, setSavingDeckId] = useState(null);

  const handleDeckClick = (deck) => {
    setActiveDeck(deck);
    navigateTo('deck-details');
  };

  const togglePin = (e, deckId) => {
    e.stopPropagation();
    setPinnedIds(prev => prev.includes(deckId) ? prev.filter(id => id !== deckId) : [...prev, deckId]);
  };

  // Fetch public community decks when community tab is active
  useEffect(() => {
    if (activeFilter === 'community') {
      let isMounted = true;
      setIsLoadingPublic(true);
      const queryParam = searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : '';
      fetch(`${API_BASE}/api/decks/public${queryParam}`)
        .then(res => res.json())
        .then(data => {
          if (isMounted) setPublicDecks(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error('Could not load public decks', err))
        .finally(() => {
          if (isMounted) setIsLoadingPublic(false);
        });
      return () => { isMounted = false; };
    }
  }, [activeFilter, searchQuery]);

  // Clone/Save a public deck to user's library
  const handleSavePublicDeck = async (e, deck) => {
    e.stopPropagation();
    setSavingDeckId(deck.id);
    try {
      const response = await fetch(`${API_BASE}/api/decks/${deck.id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, display_name: displayName }),
      });
      const cloned = await response.json();
      if (!response.ok) throw new Error(cloned.detail || 'Could not save deck');
      
      setMyDecks(prev => [cloned, ...prev]);
      toast.success('Deck saved to your library!', {
        description: `"${deck.title}" is now part of your personal flashcards.`,
      });
    } catch (err) {
      toast.error('Failed to save deck', { description: err.message });
    } finally {
      setSavingDeckId(null);
    }
  };

  const filteredLibrary = myDecks.filter(deck => {
    const matchesSearch = !searchQuery || deck.title?.toLowerCase().includes(searchQuery.toLowerCase()) || (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (activeFilter === 'created') return deck.type !== 'saved';
    if (activeFilter === 'saved') return deck.type === 'saved';
    return true;
  });

  const pinnedDecks = filteredLibrary.filter(d => pinnedIds.includes(d.id));
  const unpinnedDecks = filteredLibrary.filter(d => !pinnedIds.includes(d.id));
  const totalCards = myDecks.reduce((sum, d) => sum + (d.cards?.length || 0), 0);

  return (
    <div className="max-w-6xl w-full mx-auto pb-16 px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-stone-200/60 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-3">
            <h2 data-tour="deck-library" className="text-2xl sm:text-3xl font-extrabold text-umber dark:text-zinc-100 tracking-tight">
              {activeFilter === 'community' ? 'Community Public Decks' : 'Your Saved Decks'}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-200/60 dark:bg-zinc-800 text-taupe dark:text-zinc-300">
              {activeFilter === 'community' ? publicDecks.length : myDecks.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-taupe dark:text-zinc-400 mt-1">
            {activeFilter === 'community' 
              ? 'Discover and save study sets published by fellow students worldwide.'
              : `Manage, review, and organize your flashcard collections (${totalCards} total cards).`}
          </p>
        </div>

        <Button 
          onClick={() => navigateTo('new-deck')} 
          className="bg-umber dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-umber/90 dark:hover:bg-zinc-200 font-bold rounded-xl h-11 px-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 shrink-0 w-full sm:w-auto"
        >
          <Plus size={18} /> New Deck
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe/70 dark:text-zinc-500" size={18} />
          <Input 
            type="text" 
            placeholder={activeFilter === 'community' ? "Search public decks..." : "Search decks by title..."}
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-10 pr-9 h-11 rounded-xl text-sm border-stone-200 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-amber-600 dark:focus-visible:ring-zinc-600 bg-white dark:bg-zinc-900 shadow-xs" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe hover:text-umber dark:text-zinc-500 dark:hover:text-zinc-200 p-0.5"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-stone-200/50 dark:bg-zinc-900/80 rounded-xl border border-stone-200/80 dark:border-zinc-800/80 self-start md:self-auto">
          {[
            { id: 'all', label: 'All Decks', count: myDecks.length },
            { id: 'created', label: 'My Decks', count: myDecks.filter(d => d.type !== 'saved').length },
            { id: 'saved', label: 'Saved Decks', count: myDecks.filter(d => d.type === 'saved').length },
            { id: 'community', label: 'Explore Public', count: publicDecks.length || 'New', icon: Globe },
          ].map(filter => (
            <button 
              key={filter.id} 
              onClick={() => setActiveFilter(filter.id)} 
              className={`rounded-lg font-semibold text-xs px-3.5 py-1.5 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeFilter === filter.id 
                  ? 'bg-white text-umber shadow-xs dark:bg-zinc-800 dark:text-zinc-100 font-bold' 
                  : 'text-taupe hover:text-umber hover:bg-white/50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/50'
              }`}
            >
              {filter.icon && <filter.icon size={13} className="text-amber-600" />}
              <span>{filter.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeFilter === filter.id
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold'
                  : 'bg-stone-200/70 dark:bg-zinc-800 text-taupe dark:text-zinc-400'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Content Area */}
      <div key={activeFilter + searchQuery} className="animate-in fade-in slide-in-from-bottom-2 duration-200">
        
        {/* VIEW 1: PUBLIC COMMUNITY EXPLORE */}
        {activeFilter === 'community' ? (
          <div>
            {isLoadingPublic ? (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                <RotateCw size={32} className="animate-spin text-amber-600" />
                <p className="text-xs font-semibold text-stone-500 dark:text-zinc-400">Searching public flashcards...</p>
              </div>
            ) : publicDecks.length === 0 ? (
              <div className="py-16 text-center text-taupe dark:text-zinc-400 border-2 border-dashed border-stone-300 dark:border-zinc-800 rounded-3xl bg-white/40 dark:bg-zinc-900/40 p-8">
                <Globe size={36} className="mx-auto mb-3 text-stone-400 dark:text-zinc-600" />
                <h3 className="font-bold text-base text-stone-900 dark:text-zinc-100 mb-1">No public decks found</h3>
                <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-sm mx-auto">
                  {searchQuery ? `No public decks matched "${searchQuery}".` : 'Be the first to share a public deck with fellow students!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {publicDecks.map((deck) => {
                  const alreadySaved = myDecks.some(d => d.id === deck.id || d.title.startsWith(deck.title));
                  const isSaving = savingDeckId === deck.id;

                  return (
                    <Card 
                      key={deck.id} 
                      onClick={() => handleDeckClick(deck)} 
                      className="group relative rounded-2xl border border-stone-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/95 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[200px] p-5 overflow-hidden"
                    >
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/60 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          <Globe size={11} /> Public
                        </span>
                        <span className="text-[11px] font-medium text-stone-400 dark:text-zinc-500">
                          by {deck.author_name || 'Student'}
                        </span>
                      </div>

                      <div className="my-3">
                        <h3 className="font-bold text-umber dark:text-zinc-100 text-lg leading-snug group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                          {deck.title}
                        </h3>
                        <p className="text-xs text-taupe dark:text-zinc-400 line-clamp-2 mt-1">
                          {deck.description || `${deck.cards?.length || 0} cards available to study.`}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-zinc-800/80 mt-auto gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300">
                          <Layers size={13} className="text-amber-600" />
                          <span>{deck.cards?.length || 0} Cards</span>
                        </div>
                        
                        <Button
                          size="sm"
                          variant={alreadySaved ? "ghost" : "default"}
                          disabled={alreadySaved || isSaving}
                          onClick={(e) => handleSavePublicDeck(e, deck)}
                          className={alreadySaved 
                            ? "h-8 rounded-full text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" 
                            : "h-8 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs px-3"}
                        >
                          {isSaving ? (
                            <><RotateCw size={12} className="animate-spin mr-1.5" /> Saving</>
                          ) : alreadySaved ? (
                            <><CheckCircle size={13} className="mr-1" /> Saved</>
                          ) : (
                            <><Download size={13} className="mr-1" /> Save to Library</>
                          )}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: PERSONAL LIBRARY (Pinned + Decks Grid, duplicate button removed) */
          <>
            {/* Pinned Section */}
            {pinnedDecks.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  <p className="text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider">
                    Pinned Decks ({pinnedDecks.length})
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pinnedDecks.map((deck) => (
                    <Card 
                      key={deck.id} 
                      onClick={() => handleDeckClick(deck)} 
                      className="group relative rounded-2xl border border-stone-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/95 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[190px] p-5 overflow-hidden"
                    >
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/60 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex items-start justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          deck.visibility === 'Public' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : 'bg-stone-100 text-taupe dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {deck.visibility === 'Public' && <Globe size={10} />}
                          {deck.visibility || 'Private'}
                        </span>
                        <button 
                          onClick={(e) => togglePin(e, deck.id)} 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-500 hover:scale-110 transition-transform"
                          title="Unpin deck"
                        >
                          <Star size={18} className="fill-amber-500" />
                        </button>
                      </div>

                      <div className="my-3">
                        <h3 className="font-bold text-umber dark:text-zinc-100 text-lg leading-snug group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                          {deck.title}
                        </h3>
                        <p className="text-xs text-taupe dark:text-zinc-400 line-clamp-2 mt-1">
                          {deck.description || (deck.cards?.length ? `${deck.cards.length} flashcards ready to study.` : 'Empty deck. Add cards to begin.')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-zinc-800/80 mt-auto">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
                          <Layers size={13} className="text-amber-600 dark:text-amber-400" />
                          <span>{deck.cards?.length || 0} Cards</span>
                        </div>
                        
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-taupe group-hover:text-amber-700 dark:text-zinc-400 dark:group-hover:text-amber-400 transition-colors">
                          <span>Study</span>
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty Library State */}
            {myDecks.length === 0 ? (
              <Card className="border-2 border-dashed border-stone-300 dark:border-zinc-800 shadow-none bg-white/70 dark:bg-zinc-900/50 p-12 text-center flex flex-col items-center justify-center rounded-3xl">
                <div className="w-16 h-16 bg-amber-500/10 dark:bg-zinc-800 text-amber-700 dark:text-zinc-100 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
                  <Library size={32} />
                </div>
                <CardTitle className="text-xl font-bold text-umber dark:text-zinc-100 mb-2">
                  Your library is empty
                </CardTitle>
                <CardDescription className="text-taupe dark:text-zinc-400 text-sm mb-6 max-w-md mx-auto">
                  Create a deck from scratch or let AI generate one instantly from your topics or documents.
                </CardDescription>
                <Button 
                  onClick={() => navigateTo('new-deck')} 
                  size="lg" 
                  className="font-bold rounded-xl h-12 bg-umber hover:bg-umber/90 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white shadow-sm flex items-center gap-2 px-6"
                >
                  <Plus size={18} /> Create New Deck
                </Button>
              </Card>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider">
                    Decks ({unpinnedDecks.length})
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Note: Redundant dashed create button removed to avoid repetition */}

                  {/* Deck Cards */}
                  {unpinnedDecks.map((deck) => (
                    <Card 
                      key={deck.id} 
                      onClick={() => handleDeckClick(deck)} 
                      className="group relative rounded-2xl border border-stone-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/95 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[190px] p-5 overflow-hidden"
                    >
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/60 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex items-start justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          deck.visibility === 'Public' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : 'bg-stone-100 text-taupe dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {deck.visibility === 'Public' && <Globe size={10} />}
                          {deck.visibility || 'Private'}
                        </span>
                        <button 
                          onClick={(e) => togglePin(e, deck.id)} 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-amber-500 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all"
                          title="Pin deck"
                        >
                          <Star size={18} />
                        </button>
                      </div>

                      <div className="my-3">
                        <h3 className="font-bold text-umber dark:text-zinc-100 text-lg leading-snug group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                          {deck.title}
                        </h3>
                        <p className="text-xs text-taupe dark:text-zinc-400 line-clamp-2 mt-1">
                          {deck.description || (deck.cards?.length ? `${deck.cards.length} flashcards ready to study.` : 'Empty deck. Add cards to begin.')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-zinc-800/80 mt-auto">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
                          <Layers size={13} className="text-amber-600 dark:text-amber-400" />
                          <span>{deck.cards?.length || 0} Cards</span>
                        </div>
                        
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-taupe group-hover:text-amber-700 dark:text-zinc-400 dark:group-hover:text-amber-400 transition-colors">
                          <span>Study</span>
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* No search results */}
                  {unpinnedDecks.length === 0 && searchQuery && (
                    <div className="col-span-full py-16 text-center text-taupe dark:text-zinc-400 border-2 border-dashed border-stone-300 dark:border-zinc-800 rounded-2xl bg-white/40 dark:bg-zinc-900/40">
                      <Search size={28} className="mx-auto mb-2 text-taupe/60 dark:text-zinc-600" />
                      <p className="font-semibold text-sm">No matching decks found for "{searchQuery}"</p>
                      <p className="text-xs text-taupe/80 dark:text-zinc-500 mt-1">Try another search keyword or clear the search field.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
