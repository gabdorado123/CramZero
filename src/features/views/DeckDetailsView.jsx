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

export function DeckDetailsView({ navigateTo, activeDeck, setIsTutorOpen }) {
  if (!activeDeck) {
    return (
       <div className="max-w-5xl mx-auto p-12 text-center">
         <h2 className="text-xl font-bold text-umber dark:text-zinc-100">Deck Error</h2>
         <Button onClick={() => navigateTo('decks')} className="mt-4 bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 rounded-xl h-10 px-4">Return to Library</Button>
       </div>
    );
  }

  const formattedDate = activeDeck.created_at ? new Date(activeDeck.created_at).toLocaleDateString() : 'Just now';

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-taupe/20 dark:border-zinc-800 pb-6">
        <div>
          <Button variant="ghost" onClick={() => navigateTo('decks')} className="-ml-4 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 font-medium mb-3">
            <ArrowLeft size={16} className="mr-2" /> Back to Library
          </Button>
          <h2 className="text-2xl md:text-3xl font-bold text-umber dark:text-zinc-100 mb-2">{activeDeck.title}</h2>
          <div className="flex flex-wrap gap-3 text-xs md:text-sm font-medium text-taupe dark:text-zinc-500 items-center">
            <Badge variant="secondary" className="bg-sand dark:bg-zinc-800 text-umber dark:text-zinc-300 hover:bg-sand dark:hover:bg-zinc-800 rounded font-medium border-none">{activeDeck.cards?.length || 0} Cards</Badge>
            <span>Created {formattedDate}</span>
            <span className="flex items-center gap-1"><BookOpen size={14} /> {activeDeck.visibility || 'Private'}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 hover:bg-greige/20 dark:hover:bg-zinc-800"><Edit3 size={20} /></Button>
          <Button variant="ghost" size="icon" className="text-taupe dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"><Trash2 size={20} /></Button>
        </div>
      </div>

      <Card className="bg-amber-50/50 dark:bg-amber-950/30 border-amber-600/30 dark:border-amber-900 mb-8 shadow-sm rounded-2xl">
        <CardContent className="p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0"><Sparkles size={24} /></div>
            <div><h3 className="font-bold text-base md:text-lg text-umber dark:text-zinc-100">Zero AI is ready</h3><p className="text-taupe dark:text-zinc-400 text-xs md:text-sm">Need a mnemonic device or a simplified breakdown before you start?</p></div>
          </div>
          <Button onClick={() => setIsTutorOpen(true)} className="bg-white dark:bg-zinc-950 border border-amber-600/50 dark:border-amber-800 text-amber-700 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 font-bold shadow-sm whitespace-nowrap rounded-xl px-4 md:px-5">Open Chat</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <Card onClick={() => navigateTo('flashcard-mode')} className="bg-white dark:bg-zinc-900 border-taupe/20 dark:border-zinc-800 hover:border-umber/40 dark:hover:border-zinc-600 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between rounded-2xl shadow-sm">
          <CardContent className="p-6 pb-4">
            <div className="w-10 h-10 bg-greige/30 dark:bg-zinc-800 text-umber dark:text-zinc-300 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Layers size={20} /></div>
            <h3 className="font-bold text-lg text-umber dark:text-zinc-100 mb-2">Deep Dive</h3>
            <p className="text-taupe dark:text-zinc-500 text-xs leading-relaxed">Traditional flashcards. Self-rate confidence to train the spaced-repetition algorithm.</p>
          </CardContent>
          <CardFooter className="p-6 pt-0"><span className="text-[10px] font-bold text-umber dark:text-zinc-100 uppercase tracking-widest mt-auto">Start Review →</span></CardFooter>
        </Card>
        
        <Card onClick={() => navigateTo('quiz-setup')} className="bg-white dark:bg-zinc-900 border-taupe/20 dark:border-zinc-800 hover:border-umber/40 dark:hover:border-zinc-600 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between rounded-2xl shadow-sm">
          <CardContent className="p-6 pb-4">
            <div className="w-10 h-10 bg-greige/30 dark:bg-zinc-800 text-umber dark:text-zinc-300 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><CheckCircle size={20} /></div>
            <h3 className="font-bold text-lg text-umber dark:text-zinc-100 mb-2">Knowledge Check</h3>
            <p className="text-taupe dark:text-zinc-500 text-xs leading-relaxed">Test yourself with standard multiple-choice and identification questions.</p>
          </CardContent>
          <CardFooter className="p-6 pt-0"><span className="text-[10px] font-bold text-umber dark:text-zinc-100 uppercase tracking-widest mt-auto">Configure Quiz →</span></CardFooter>
        </Card>

        <Card onClick={() => navigateTo('mock-exam-setup')} className="bg-rose-600 dark:bg-rose-900/80 border-rose-700 dark:border-rose-800 shadow-md hover:bg-rose-700 dark:hover:bg-rose-800 hover:shadow-lg cursor-pointer transition-all group flex flex-col justify-between relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Timer size={100} className="text-white"/></div>
          <CardContent className="p-6 pb-4 relative z-10 text-white">
            <div className="w-10 h-10 bg-white/20 text-white rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Timer size={20} /></div>
            <h3 className="font-bold text-lg mb-2 text-white">AI Mock Exam</h3>
            <p className="text-white/80 text-xs leading-relaxed">High-stakes simulation. AI generates complex trick scenarios based on your cards.</p>
          </CardContent>
          <CardFooter className="p-6 pt-0 relative z-10"><span className="text-[10px] font-bold text-white uppercase tracking-widest mt-auto">Start Simulator →</span></CardFooter>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-base md:text-lg text-umber dark:text-zinc-100">Card Inventory</h3></div>
        {activeDeck.cards?.length === 0 ? (
           <Card className="text-center p-8 text-taupe dark:text-zinc-500 text-sm shadow-sm border-taupe/30 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl">No cards in this deck yet.</Card>
        ) : (
          <div className="space-y-3">
            {activeDeck.cards?.map((card, i) => (
              <Card key={card.id} className="p-4 flex flex-col md:flex-row gap-4 md:gap-6 hover:bg-sand/10 dark:hover:bg-zinc-800/50 transition-colors shadow-sm border-taupe/20 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl">
                <div className="flex-1 md:border-r md:border-taupe/20 dark:md:border-zinc-800 md:pr-6"><p className="text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-1">Term</p><p className="text-umber dark:text-zinc-100 font-medium text-sm md:text-base">{card.term}</p></div>
                <div className="flex-[2]"><p className="text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-1">Definition</p><p className="text-umber dark:text-zinc-300 text-xs md:text-sm">{card.definition}</p></div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// FIXED: Reverted to user's original preferred structure with bottom rating buttons visible.
