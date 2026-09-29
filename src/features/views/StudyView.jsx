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
      <div className="flex flex-col items-center justify-center h-[60vh] max-w-4xl mx-auto">
        <Card className="max-w-lg w-full p-12 text-center border-dashed border-taupe/30 dark:border-zinc-800 shadow-none bg-transparent">
          <div className="w-16 h-16 bg-greige/30 dark:bg-zinc-900 text-umber dark:text-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4"><Layers size={32} /></div>
          <CardTitle className="text-2xl mb-2 text-umber dark:text-zinc-100">Nothing to study</CardTitle>
          <CardDescription className="text-base mb-8 text-taupe dark:text-zinc-400">Your library is empty. You need to create or import a deck before starting a study session.</CardDescription>
          <Button onClick={() => navigateTo('new-deck')} size="lg" className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 font-bold rounded-xl h-14 px-8">Create a Deck</Button>
        </Card>
      </div>
    );
  }

  const dueCount = enrolledIds.length * 12;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['Review', 'Quiz', 'Flashcards'].map((tab) => (
          <Button 
            key={tab} 
            variant="outline"
            onClick={() => setActiveTab(tab)} 
            className={`rounded-full font-bold px-6 border-taupe/20 dark:border-zinc-800 transition-all ${activeTab === tab ? 'bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 border-transparent hover:bg-umber/90 dark:hover:bg-zinc-300 shadow-sm' : 'bg-white dark:bg-zinc-900 text-umber dark:text-zinc-300 hover:bg-greige/10 dark:hover:bg-zinc-800'}`}
          >
            {tab === 'Review' ? 'Spaced Repetition' : tab}
          </Button>
        ))}
      </div>

      <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'Review' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="md:col-span-2 p-6 md:p-8 bg-umber dark:bg-zinc-200 text-sand dark:text-zinc-900 rounded-3xl shadow-xl flex flex-col justify-center border-none">
                <h3 className="text-3xl md:text-4xl font-black mb-2">{dueCount} Cards Due</h3>
                <p className="text-sand/80 dark:text-zinc-700 font-medium mb-6">Across {enrolledIds.length} enrolled decks for today's spaced repetition session.</p>
                <Button onClick={() => startCombinedSession('flashcard-mode')} disabled={dueCount === 0} className="w-max bg-white dark:bg-zinc-900 text-umber dark:text-zinc-100 hover:bg-greige/20 dark:hover:bg-zinc-800 font-bold px-8 h-12 rounded-xl shadow-md border-none">
                   Start Daily Review <Play size={16} className="ml-2"/>
                </Button>
              </Card>
              <Card className="p-6 rounded-3xl border-taupe/20 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center text-center shadow-sm">
                 <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 rounded-full flex items-center justify-center mb-4"><TrendingUp size={28}/></div>
                 <h4 className="font-bold text-xl text-umber dark:text-zinc-100">86% Retention</h4>
                 <p className="text-xs text-taupe dark:text-zinc-500 mt-1">Based on last 7 days</p>
              </Card>
            </div>

            <p className="text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-4">Spaced Repetition Enrollment</p>
            <div className="space-y-3">
               {myDecks.map(deck => {
                 const isEnrolled = enrolledIds.includes(deck.id);
                 return (
                   <Card key={deck.id} className="shadow-sm border-taupe/30 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
                     <CardContent className="flex justify-between items-center p-4 md:p-5">
                       <div>
                         <span className="font-bold text-umber dark:text-zinc-100 block text-sm md:text-base">{deck.title}</span>
                         <span className="text-xs text-taupe dark:text-zinc-500">{deck.cards?.length || 0} total cards</span>
                       </div>
                       <Switch checked={isEnrolled} onCheckedChange={() => toggleEnrollment(deck.id)} className="data-[state=checked]:bg-emerald-500" />
                     </CardContent>
                   </Card>
                 );
               })}
            </div>
          </div>
        )}

        {activeTab === 'Quiz' && (
          <div>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-xl font-bold text-umber dark:text-zinc-100">Knowledge Check</h3>
                <p className="text-sm text-taupe dark:text-zinc-400 mt-1">Select a deck to configure your multiple-choice assessment.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myDecks.map(deck => (
                <Card key={deck.id} onClick={() => { setActiveDeck(deck); navigateTo('quiz-setup'); }} className="cursor-pointer hover:border-umber/40 dark:hover:border-zinc-600 transition-all p-5 shadow-sm border-taupe/20 dark:border-zinc-800 bg-white dark:bg-zinc-900 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-greige/30 dark:bg-zinc-800 flex items-center justify-center text-umber dark:text-zinc-300 group-hover:scale-110 transition-transform"><CheckCircle size={20}/></div>
                    <Badge variant="secondary" className="bg-sand dark:bg-zinc-800 text-umber dark:text-zinc-300 border-none">{deck.cards?.length || 0} Qs</Badge>
                  </div>
                  <h4 className="font-bold text-lg text-umber dark:text-zinc-100 truncate pr-2">{deck.title}</h4>
                  <p className="text-xs text-taupe dark:text-zinc-500 mt-1 font-medium group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1">Configure Quiz <ArrowRight size={12}/></p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Flashcards' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-umber dark:text-zinc-100">Deep Dive</h3>
                <p className="text-sm text-taupe dark:text-zinc-400 mt-1">Master individual topics or combine everything.</p>
              </div>
              <Button size="lg" onClick={() => startCombinedSession('flashcard-mode')} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 rounded-xl font-bold h-12 shadow-sm w-full md:w-auto">
                <Layers size={18} className="mr-2" /> Combine All Decks
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myDecks.map(deck => (
                <Card key={deck.id} onClick={() => { setActiveDeck(deck); navigateTo('flashcard-mode'); }} className="cursor-pointer hover:border-umber/40 dark:hover:border-zinc-600 transition-all p-5 shadow-sm border-taupe/20 dark:border-zinc-800 bg-white dark:bg-zinc-900 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-sand dark:bg-zinc-800 flex items-center justify-center text-umber dark:text-zinc-300 group-hover:scale-110 transition-transform"><BookOpen size={20}/></div>
                    <Badge variant="outline" className="text-taupe dark:text-zinc-400 border-taupe/30 dark:border-zinc-700">{deck.cards?.length || 0} Cards</Badge>
                  </div>
                  <h4 className="font-bold text-lg text-umber dark:text-zinc-100 truncate pr-2">{deck.title}</h4>
                  <p className="text-xs text-taupe dark:text-zinc-500 mt-1 font-medium group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1">Start Flashcards <ArrowRight size={12}/></p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
