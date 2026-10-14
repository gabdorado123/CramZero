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

export function NewDeckView({ navigateTo, myDecks, setMyDecks, userId, setIsActionLoading, setActionMessage }) {
  const [deckName, setDeckName] = useState('');
  const [deckDesc, setDeckDesc] = useState('');
  const [inputMode, setInputMode] = useState(null); 
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [previewDeck, setPreviewDeck] = useState(null);
  const [cardCount, setCardCount] = useState(10);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToDatabase = async (deckPayload) => {
     setIsSaving(true);
     try {
         const payloadWithUser = {
           ...deckPayload,
           user_id: userId,
         };
         const response = await fetch(`${API_BASE}/api/decks/`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payloadWithUser)
         });
         if (response.ok) {
             const savedDeck = await response.json();
             setMyDecks([savedDeck, ...myDecks]);
             toast.success("Deck Saved", { description: `"${deckPayload.title || 'New Deck'}" has been added to your library.` });
             navigateTo('decks');
           }
         } catch (error) {
       toast.error("Failed to save deck", { description: "Please check your connection and try again." });
     } finally {
       setIsSaving(false);
     }
  };

  const handleManualCreate = (e) => {
    e.preventDefault();
    if(!deckName.trim()) return;
    handleSaveToDatabase({
      title: deckName,
      description: deckDesc || "",
      visibility: "Private",
      user_id: userId,
      cards: [{ term: 'Sample Term', definition: 'Update this card by editing the deck.' }]
    });
  };

  const handleGenerateAIDeck = async (e) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    
    setIsGeneratingAI(true);
    setProgress(10);
    const interval = setInterval(() => {
        setProgress(p => p < 90 ? p + Math.floor(Math.random() * 15) : 90);
    }, 500);
    
    try {
      const response = await fetch(`${API_BASE}/api/generate-deck/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, card_count: cardCount, user_id: userId })
      });
      
      if (response.ok) {
        const generatedPreview = await response.json();
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
           setPreviewDeck(generatedPreview); 
           setInputMode(null); 
           setAiTopic('');
           setIsGeneratingAI(false);
           toast.success("Generation Complete", { description: `${generatedPreview.cards.length} cards extracted from your topic.` });
        }, 500);
      } else {
        clearInterval(interval);
        setIsGeneratingAI(false);
        toast.error("Generation failed", { description: "The server encountered an error." });
      }
    } catch (error) {
      clearInterval(interval);
      setIsGeneratingAI(false);
      toast.error("Connection Error", { description: "Could not connect to the backend server." });
    } 
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setInputMode('file'); 
    setIsGeneratingAI(true);
    setProgress(10);
    const interval = setInterval(() => {
        setProgress(p => p < 90 ? p + Math.floor(Math.random() * 15) : 90);
    }, 500);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("card_count", cardCount);
    if (userId) formData.append("user_id", userId);

    try {
      const response = await fetch(`${API_BASE}/api/generate-deck-from-file/`, {
        method: 'POST',
        body: formData 
      });
      
      if (response.ok) {
        const generatedPreview = await response.json();
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
           setPreviewDeck(generatedPreview); 
           setInputMode(null);
           setIsGeneratingAI(false);
           toast.success("File Processed", { description: `${generatedPreview.cards.length} cards extracted successfully.` });
        }, 500);
      } else {
        clearInterval(interval);
        setIsGeneratingAI(false);
        setInputMode(null); 
        toast.error("File processing failed", { description: "The server encountered an error parsing your file." });
      }
    } catch (error) {
      clearInterval(interval);
      setIsGeneratingAI(false);
      setInputMode(null);
      toast.error("Connection Error", { description: "Could not connect to the backend server." });
    } finally {
      event.target.value = null; 
    }
  };

  if (previewDeck) {
    return (
      <div className="max-w-4xl mx-auto animate-in slide-in-from-right-8 duration-300 pb-12 p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-umber dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="text-amber-600 dark:text-amber-500"/> Review AI Output
          </h2>
          <div className="flex gap-3">
             <Button variant="ghost" onClick={() => setPreviewDeck(null)} className="font-bold text-taupe dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg">Discard</Button>
             <Button onClick={() => handleSaveToDatabase(previewDeck)} disabled={isSaving} className="bg-umber dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 font-bold rounded-xl shadow-md min-w-[150px]">
                {isSaving ? <RotateCw className="mr-2 animate-spin" size={16} /> : <CheckCircle size={16} className="mr-2"/>}
                {isSaving ? "Saving..." : "Save to Library"}
             </Button>
          </div>
        </div>
        
        <Card className="p-6 shadow-sm mb-6 border-taupe/30 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl">
           <label className="block text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-2">Deck Title</label>
           <Input 
             value={previewDeck.title} 
             onChange={(e) => setPreviewDeck({...previewDeck, title: e.target.value})}
             className="h-14 text-lg font-bold bg-stone-50 dark:bg-zinc-950 border-taupe/40 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-umber dark:focus-visible:ring-zinc-600 rounded-lg"
           />
        </Card>

        <h3 className="font-bold text-lg text-umber dark:text-zinc-100 mb-4">Generated Flashcards ({previewDeck.cards.length})</h3>
        <div className="space-y-3">
          {previewDeck.cards.map((card, i) => (
            <Card key={i} className="p-4 flex flex-col md:flex-row gap-4 md:gap-6 shadow-sm border-taupe/20 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl">
              <div className="flex-1 md:border-r md:border-taupe/20 dark:md:border-zinc-800 md:pr-6">
                <p className="text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-1">Term</p>
                <p className="text-umber dark:text-zinc-100 font-medium">{card.term}</p>
              </div>
              <div className="flex-[2]">
                <p className="text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-1">Definition</p>
                <p className="text-umber dark:text-zinc-300 text-sm">{card.definition}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8 pb-16 px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-zinc-800/80">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigateTo('decks')} className="-ml-3 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 font-semibold mb-1">
            <ArrowLeft size={16} className="mr-1.5" /> Back to Library
          </Button>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-umber dark:text-zinc-100 tracking-tight">Create New Deck</h2>
          <p className="text-xs sm:text-sm text-taupe dark:text-zinc-400 mt-0.5">Synthesize notes instantly with AI or create your own custom card set.</p>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.pptx,.txt" className="hidden" />

      {/* Primary AI Generator Card */}
      <Card className="rounded-3xl border border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/60 via-white to-white dark:from-amber-950/20 dark:via-zinc-900 dark:to-zinc-900 p-6 md:p-8 shadow-sm">
        {isGeneratingAI ? (
          <div className="w-full flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-5 text-amber-600 dark:text-amber-400">
              <RotateCw size={32} className="animate-spin" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-umber dark:text-zinc-100 mb-1">
              {inputMode === 'file' ? 'Parsing & Extracting Document...' : 'Zero AI is Compiling Your Flashcards...'}
            </h3>
            <p className="text-xs md:text-sm text-taupe dark:text-zinc-400 mb-6">
              Analyzing key concepts, drafting precise definitions, and organizing your deck.
            </p>
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-xs font-bold text-amber-800 dark:text-amber-400">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2.5 [&>div]:bg-amber-500 rounded-full" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerateAIDeck} className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-umber dark:text-zinc-100 tracking-tight">Generate Flashcards with AI</h3>
                  <p className="text-xs md:text-sm text-taupe dark:text-zinc-400">Enter any topic or concept to generate a ready-to-study deck in seconds.</p>
                </div>
              </div>
            </div>

            {/* Topic Input */}
            <div>
              <label className="block text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider mb-2">
                Study Topic or Keyword
              </label>
              <div className="relative">
                <Input 
                  value={aiTopic} 
                  onChange={(e) => setAiTopic(e.target.value)} 
                  placeholder="e.g., 'World War II Key Turning Points' or 'Neurotransmitters & Synapses'" 
                  className="h-12 pl-4 pr-10 text-sm md:text-base bg-white dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-amber-500 rounded-xl shadow-2xs"
                />
                {aiTopic && (
                  <button 
                    type="button" 
                    onClick={() => setAiTopic('')} 
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-taupe hover:text-umber dark:text-zinc-500 dark:hover:text-zinc-200"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Deck Size Selector */}
            <div>
              <label className="block text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider mb-2.5">
                Deck Size
              </label>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {[5, 10, 15, 20].map((num) => (
                  <button 
                    key={num} 
                    type="button" 
                    onClick={() => setCardCount(num)} 
                    className={`h-11 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      cardCount === num 
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-[1.02]' 
                        : 'bg-white dark:bg-zinc-950 text-umber dark:text-zinc-300 border-stone-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700'
                    }`}
                  >
                    <span>{num}</span>
                    <span className="font-normal opacity-90 text-[11px] hidden sm:inline">Cards</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200/60 dark:border-zinc-800/80">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="text-xs font-semibold text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1.5 py-1"
              >
                <UploadCloud size={16} /> Or import notes from file (.pdf, .pptx, .txt)
              </button>
              
              <Button 
                type="submit" 
                disabled={!aiTopic.trim()} 
                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-11 px-7 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles size={16} /> Generate {cardCount} Cards
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Divider */}
      <div className="flex items-center gap-4 w-full">
        <div className="h-px bg-stone-200 dark:bg-zinc-800 flex-1"></div>
        <span className="text-[11px] font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest">Or create from scratch</span>
        <div className="h-px bg-stone-200 dark:bg-zinc-800 flex-1"></div>
      </div>
      
      {/* Manual Creation Card */}
      <Card className="p-6 md:p-8 shadow-xs border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl">
        <form onSubmit={handleManualCreate}>
          <div className="flex items-center gap-3 border-b border-stone-200/60 dark:border-zinc-800/80 pb-4 mb-6">
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-zinc-800 text-umber dark:text-zinc-100 flex items-center justify-center">
              <Edit3 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-umber dark:text-zinc-100">Manual Deck Setup</h3>
              <p className="text-xs text-taupe dark:text-zinc-400">Create an empty deck structure and add flashcards one by one.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider mb-2">Deck Title *</label>
              <Input 
                type="text" 
                value={deckName} 
                onChange={(e) => setDeckName(e.target.value)} 
                required 
                placeholder="e.g. Constitutional Law Principles" 
                className="h-11 bg-stone-50/50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-amber-600 rounded-xl" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider mb-2">Description (Optional)</label>
              <Textarea 
                value={deckDesc} 
                onChange={(e) => setDeckDesc(e.target.value)} 
                placeholder="Briefly describe what this deck covers..." 
                className="h-20 resize-none bg-stone-50/50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-amber-600 rounded-xl text-sm" 
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-stone-200/60 dark:border-zinc-800/80">
            <Button 
              type="submit" 
              size="lg" 
              disabled={!deckName.trim() || isSaving} 
              className="bg-umber dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-umber/90 dark:hover:bg-zinc-200 font-bold px-7 h-11 rounded-xl shadow-xs disabled:opacity-50 min-w-[160px]"
            >
              {isSaving ? <RotateCw className="mr-2 animate-spin" size={16} /> : null}
              {isSaving ? "Saving..." : "Create Empty Deck"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
