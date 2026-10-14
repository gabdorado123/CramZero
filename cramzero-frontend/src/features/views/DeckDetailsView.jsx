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
import { API_BASE } from '@/lib/api';

export function DeckDetailsView({ navigateTo, activeDeck, setIsTutorOpen }) {
  const [isGeneratingReadout, setIsGeneratingReadout] = useState(false);

  const handleDownloadReadout = async () => {
    setIsGeneratingReadout(true);
    try {
      const response = await fetch(`${API_BASE}/api/decks/${activeDeck.id}/readout`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'The reading guide could not be generated.');
      }

      const pdfBlob = await response.blob();
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `${activeDeck.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'cramzero'}-reading-guide.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(downloadUrl);
      toast.success('Reading guide downloaded', { description: 'Zero AI created a PDF from this deck.' });
    } catch (error) {
      toast.error('Could not create reading guide', { description: error.message });
    } finally {
      setIsGeneratingReadout(false);
    }
  };

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

      <Card className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-zinc-900/40 dark:to-transparent border border-amber-500/25 dark:border-amber-900/50 mb-8 shadow-xs rounded-3xl overflow-hidden">
        <CardContent className="p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <img src="/zero-ai-logo.svg" alt="Zero AI" className="w-12 h-12 rounded-2xl p-1 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs shrink-0" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-extrabold text-base md:text-lg text-stone-900 dark:text-zinc-100 tracking-tight">Zero AI is ready to tutor</h3>
              <p className="text-stone-600 dark:text-zinc-400 text-xs md:text-sm">Need a mnemonic device, custom analogy, or quick breakdown before starting?</p>
            </div>
          </div>
          <Button onClick={() => setIsTutorOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs whitespace-nowrap rounded-full px-5 h-10 transition-all hover:shadow-md">
            <Sparkles size={15} className="mr-1.5" /> Open Chat
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 mb-12 lg:grid-cols-2 xl:grid-cols-4">
        <Card onClick={() => navigateTo('flashcard-mode')} className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-stone-200/90 dark:border-white/10 hover:border-amber-500/50 dark:hover:border-amber-400/50 hover:shadow-xl cursor-pointer transition-all duration-300 group flex flex-col justify-between rounded-3xl shadow-sm hover:-translate-y-1">
          <CardContent className="p-6 pb-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-xs">
              <Layers size={22} />
            </div>
            <h3 className="font-bold text-lg text-umber dark:text-zinc-100 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Deep Dive</h3>
            <p className="text-taupe dark:text-zinc-400 text-xs leading-relaxed">Traditional flashcards. Self-rate confidence to train the spaced-repetition algorithm.</p>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <span className="inline-flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              Start Review →
            </span>
          </CardFooter>
        </Card>
        
        <Card onClick={() => navigateTo('quiz-setup')} className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-stone-200/90 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-emerald-400/50 hover:shadow-xl cursor-pointer transition-all duration-300 group flex flex-col justify-between rounded-3xl shadow-sm hover:-translate-y-1">
          <CardContent className="p-6 pb-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-xs">
              <CheckCircle size={22} />
            </div>
            <h3 className="font-bold text-lg text-umber dark:text-zinc-100 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Knowledge Check</h3>
            <p className="text-taupe dark:text-zinc-400 text-xs leading-relaxed">Test yourself with standard multiple-choice and identification questions.</p>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              Configure Quiz →
            </span>
          </CardFooter>
        </Card>

        <Card onClick={() => navigateTo('mock-exam-setup')} className="bg-gradient-to-br from-rose-600 via-rose-600 to-rose-700 dark:from-rose-900 dark:to-rose-950 border border-rose-500/50 dark:border-rose-700/50 shadow-md hover:shadow-2xl cursor-pointer transition-all duration-300 group flex flex-col justify-between relative overflow-hidden rounded-3xl hover:-translate-y-1">
          <div className="absolute -right-4 -bottom-4 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
            <Timer size={120} className="text-white"/>
          </div>
          <CardContent className="p-6 pb-4 relative z-10 text-white">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-xs">
              <Timer size={22} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">AI Mock Exam</h3>
            <p className="text-white/90 text-xs leading-relaxed">High-stakes simulation. AI generates complex trick scenarios based on your cards.</p>
          </CardContent>
          <CardFooter className="p-6 pt-0 relative z-10">
            <span className="inline-flex items-center text-xs font-semibold text-white group-hover:translate-x-1 transition-transform">
              Start Simulator →
            </span>
          </CardFooter>
        </Card>

        <Card className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-stone-200/90 dark:border-white/10 shadow-sm rounded-3xl flex flex-col justify-between hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 pb-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-5 shadow-xs">
              <FileText size={22} />
            </div>
            <h3 className="font-bold text-lg text-umber dark:text-zinc-100 mb-2">Reading Material</h3>
            <p className="text-taupe dark:text-zinc-400 text-xs leading-relaxed">Turn this deck into a structured AI study guide and download it as a PDF.</p>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Button onClick={handleDownloadReadout} disabled={isGeneratingReadout} className="w-full rounded-full h-11 bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200 font-semibold shadow-xs">
              {isGeneratingReadout ? <RotateCw size={16} className="mr-2 animate-spin" /> : <Download size={16} className="mr-2" />}
              {isGeneratingReadout ? 'Generating...' : 'Download PDF'}
            </Button>
          </CardFooter>
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
