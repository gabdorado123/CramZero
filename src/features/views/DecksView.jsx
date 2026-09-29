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

export function DecksView({ navigateTo, setActiveDeck, myDecks, setMyDecks }) {
  const [pinnedIds, setPinnedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const handleDeckClick = (deck) => { setActiveDeck(deck); navigateTo('deck-details'); };
  const togglePin = (e, deckId) => { e.stopPropagation(); setPinnedIds(prev => prev.includes(deckId) ? prev.filter(id => id !== deckId) : [...prev, deckId]); };

  const filteredLibrary = myDecks.filter(deck => deck.title.toLowerCase().includes(searchQuery.toLowerCase()) && (activeFilter === 'all' || deck.type === activeFilter));
  const pinnedDecks = filteredLibrary.filter(deck => pinnedIds.includes(deck.id));
  const unpinnedDecks = filteredLibrary.filter(deck => !pinnedIds.includes(deck.id));

  return (
    <div className="max-w-5xl mx-auto pb-12 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-umber dark:text-zinc-100">Your Saved Decks</h2>
        <Button onClick={() => navigateTo('new-deck')} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 font-medium rounded-lg h-10 px-4 shadow-sm">
          <Plus size={18} className="mr-2" /> New Deck
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-taupe dark:text-zinc-500" size={20} />
        <Input type="text" placeholder="Search your library..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 h-14 rounded-xl text-sm border-taupe/30 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-umber dark:focus-visible:ring-zinc-600 bg-white dark:bg-zinc-900 shadow-sm" />
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['all', 'created', 'saved'].map(filter => (
          <Button 
            key={filter} 
            variant="outline"
            onClick={() => setActiveFilter(filter)} 
            className={`rounded-full font-bold capitalize px-6 border-taupe/20 dark:border-zinc-800 transition-all ${activeFilter === filter ? 'bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 border-transparent hover:bg-umber/90 dark:hover:bg-zinc-300 shadow-sm' : 'bg-white dark:bg-zinc-900 text-umber dark:text-zinc-300 hover:bg-greige/10 dark:hover:bg-zinc-800'}`}
          >
            {filter === 'all' ? 'All Decks' : filter === 'created' ? 'My Decks' : 'Saved Decks'}
          </Button>
        ))}
      </div>
      
      <div key={activeFilter + searchQuery} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {pinnedDecks.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-4">Pinned ({pinnedDecks.length})</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedDecks.map((deck) => (
                <Card key={deck.id} onClick={() => handleDeckClick(deck)} className="bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-40 group relative">
                  <button onClick={(e) => togglePin(e, deck.id)} className="absolute top-5 right-5 text-amber-500 hover:scale-110 transition-transform"><Star size={20} fill="currentColor" /></button>
                  <CardContent className="pt-5 pb-0">
                    <h3 className="font-semibold text-umber dark:text-zinc-100 text-lg group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors pr-8 truncate">{deck.title}</h3>
                    <div className="flex items-center gap-2 mt-1">{deck.type === 'saved' && <Badge variant="secondary" className="bg-greige/50 dark:bg-zinc-800 text-umber dark:text-zinc-300 text-[10px] uppercase font-bold tracking-widest hover:bg-greige/50 dark:hover:bg-zinc-800 border-none">Saved</Badge>}</div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between mt-auto pb-5">
                    <Badge variant="outline" className="bg-sand dark:bg-zinc-950 border-transparent text-umber dark:text-zinc-300">{deck.cards.length} Cards</Badge>
                    <div className="text-taupe dark:text-zinc-500 group-hover:text-umber dark:group-hover:text-zinc-100 transition-colors p-2 rounded-full"><Play size={20}/></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {myDecks.length === 0 ? (
          <Card className="border-2 border-dashed border-taupe/30 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 p-12 text-center flex flex-col items-center justify-center rounded-3xl">
              <div className="w-16 h-16 bg-greige/30 dark:bg-zinc-800 text-umber dark:text-zinc-100 rounded-full flex items-center justify-center mb-4"><Library size={32} /></div>
              <CardTitle className="text-xl font-bold text-umber dark:text-zinc-100 mb-2">Your library is empty</CardTitle>
              <CardDescription className="text-taupe dark:text-zinc-400 text-sm mb-6 max-w-md mx-auto">Create a deck from scratch or let AI generate one from your documents.</CardDescription>
              <Button onClick={() => navigateTo('new-deck')} variant="outline" size="lg" className="font-bold rounded-xl h-12 bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-700 text-umber dark:text-zinc-100 hover:bg-greige/10 dark:hover:bg-zinc-800 shadow-sm">
                  <Plus size={18} className="mr-2" /> Create New Deck
              </Button>
          </Card>
        ) : (
          <div>
            <p className="text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-4">Library Results ({unpinnedDecks.length})</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {!searchQuery && activeFilter === 'all' && (
                <Card onClick={() => navigateTo('new-deck')} className="border-2 border-dashed border-taupe/50 dark:border-zinc-700 bg-greige/10 dark:bg-zinc-900/50 hover:bg-greige/30 dark:hover:bg-zinc-800 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all h-40 text-umber dark:text-zinc-300 group shadow-none">
                  <div className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform"><Plus size={24} /></div><span className="font-semibold text-sm">Create New Deck</span>
                </Card>
              )}
              {unpinnedDecks.map((deck) => (
                <Card key={deck.id} onClick={() => handleDeckClick(deck)} className="bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-40 group relative animate-in zoom-in duration-200">
                  <button onClick={(e) => togglePin(e, deck.id)} className="absolute top-5 right-5 text-taupe dark:text-zinc-600 hover:text-amber-500 dark:hover:text-amber-500 hover:scale-110 transition-all z-10"><Star size={20} /></button>
                  <CardContent className="pt-5 pb-0">
                    <h3 className="font-semibold text-umber dark:text-zinc-100 text-lg group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors pr-8 truncate">{deck.title}</h3>
                    <div className="flex items-center gap-2 mt-1">{deck.type === 'saved' && <Badge variant="secondary" className="bg-greige/50 dark:bg-zinc-800 text-umber dark:text-zinc-300 hover:bg-greige/50 dark:hover:bg-zinc-800 text-[10px] uppercase font-bold tracking-widest border-none">Saved</Badge>}</div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between mt-auto pb-5">
                    <Badge variant="outline" className="bg-sand dark:bg-zinc-950 border-transparent text-umber dark:text-zinc-300">{deck.cards.length} Cards</Badge>
                    <div className="text-taupe dark:text-zinc-500 group-hover:text-umber dark:group-hover:text-zinc-100 transition-colors p-2 rounded-full"><Play size={20}/></div>
                  </CardFooter>
                </Card>
              ))}
              {unpinnedDecks.length === 0 && searchQuery && (<div className="col-span-full py-12 text-center text-taupe dark:text-zinc-500 border-2 border-dashed border-taupe/30 dark:border-zinc-800 rounded-xl">No matching decks found.</div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
