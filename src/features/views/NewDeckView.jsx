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

export function NewDeckView({ navigateTo, myDecks, setMyDecks, setIsActionLoading, setActionMessage }) {
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
       const response = await fetch('http://127.0.0.1:8000/api/decks/', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(deckPayload)
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
      const response = await fetch('http://127.0.0.1:8000/api/generate-deck/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, card_count: cardCount })
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

    try {
      const response = await fetch('http://127.0.0.1:8000/api/generate-deck-from-file/', {
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
             <Button onClick={() => handleSaveToDatabase(previewDeck)} disabled={isSaving} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 font-bold rounded-lg shadow-md min-w-[150px]">
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
             className="h-14 text-lg font-bold bg-sand/20 dark:bg-zinc-950 border-taupe/40 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-umber dark:focus-visible:ring-zinc-600 rounded-lg"
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
    <div className="max-w-4xl mx-auto space-y-6 overflow-x-hidden p-4 md:p-8">
      <Button variant="ghost" onClick={() => navigateTo('decks')} className="-ml-4 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 font-medium mb-2 text-sm">
        <ArrowLeft size={18} className="mr-2" /> Back to Library
      </Button>
      
      <Card className="p-6 shadow-sm mb-4 border-taupe/30 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl">
        <h3 className="font-bold text-umber dark:text-zinc-100 mb-4 flex items-center gap-2"><Settings size={18}/> AI Generation Settings</h3>
        <label className="block text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-3">Cards to Generate</label>
        <div className="flex gap-2 sm:gap-4">
          {[5, 10, 15, 20].map(num => (
            <Button 
              key={num}
              type="button"
              variant="outline"
              onClick={() => setCardCount(num)}
              className={`flex-1 h-12 font-bold text-sm md:text-base border-2 transition-all rounded-xl ${cardCount === num ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 dark:border-amber-600 text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:text-amber-800 dark:hover:text-amber-400 scale-[1.02]' : 'bg-greige/10 dark:bg-zinc-800 text-taupe dark:text-zinc-400 hover:bg-greige/20 dark:hover:bg-zinc-700 hover:text-umber dark:hover:text-zinc-100 border-transparent'}`}
            >
              {num} <span className="hidden sm:inline ml-1">Cards</span>
            </Button>
          ))}
        </div>
      </Card>

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.pptx,.txt" className="hidden" />

      <div className="flex flex-col md:flex-row gap-4 w-full">
          <div 
            onClick={() => !isGeneratingAI && fileInputRef.current?.click()} 
            className={`relative overflow-hidden transition-all duration-500 ease-in-out border-2 border-dashed bg-greige/10 dark:bg-zinc-900/50 rounded-2xl flex flex-col items-center justify-center text-center 
              ${inputMode === 'file' ? 'w-full md:w-full opacity-100 p-8 md:p-12 border-umber/50 dark:border-zinc-500' : 
                inputMode === 'ai' ? 'w-full md:w-0 opacity-0 p-0 border-0 h-0 md:h-auto gap-0 m-0 pointer-events-none' : 
                'w-full md:w-1/2 p-6 md:p-8 cursor-pointer hover:bg-greige/20 dark:hover:bg-zinc-800 border-taupe/50 dark:border-zinc-700'}
            `}
          >
            {isGeneratingAI && inputMode === 'file' ? (
                <div className="w-full max-w-sm flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in duration-300">
                   <RotateCw size={32} className="text-amber-500 animate-spin mb-4" />
                   <div className="w-full space-y-2">
                      <div className="flex justify-between text-sm font-bold text-amber-800 dark:text-amber-500">
                         <span>Parsing document...</span>
                         <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 [&>div]:bg-amber-500" />
                   </div>
                   <p className="text-xs text-muted-foreground mt-4 animate-pulse">Extracting key terms from file.</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-w-[200px]">
                  <UploadCloud size={32} className="text-umber dark:text-zinc-100 mb-3" />
                  <h3 className="font-bold text-base md:text-lg text-umber dark:text-zinc-100 mb-1 whitespace-nowrap">Import from file</h3>
                  <p className="text-taupe dark:text-zinc-500 text-xs md:text-sm whitespace-nowrap">.pdf, .pptx, or .txt</p>
                </div>
            )}
          </div>
          
          <div 
            className={`relative overflow-hidden transition-all duration-500 ease-in-out rounded-2xl flex flex-col justify-center 
              ${inputMode === 'ai' ? 'w-full md:w-full opacity-100 border border-amber-600/30 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-6 shadow-sm' : 
                inputMode === 'file' ? 'w-full md:w-0 opacity-0 p-0 border-0 h-0 md:h-auto m-0 pointer-events-none' : 
                'w-full md:w-1/2 p-6 md:p-8 border border-amber-600/30 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/30 shadow-sm text-center'}
            `}
            onClick={() => !inputMode && setInputMode('ai')}
          >
            {inputMode === 'ai' ? (
              isGeneratingAI ? (
                <div className="w-full flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in duration-300">
                   <RotateCw size={32} className="text-amber-500 animate-spin mb-4" />
                   <div className="w-full max-w-sm space-y-2">
                      <div className="flex justify-between text-sm font-bold text-amber-800 dark:text-amber-500">
                         <span>Synthesizing knowledge...</span>
                         <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 [&>div]:bg-amber-500" />
                   </div>
                   <p className="text-xs text-amber-700/70 dark:text-amber-500/70 mt-4 animate-pulse">Professor Zero is compiling your flashcards.</p>
                </div>
              ) : (
                <form onSubmit={handleGenerateAIDeck} className="w-full flex flex-col animate-in fade-in duration-300 delay-150 min-w-[250px]">
                   <label className="font-bold text-amber-800 dark:text-amber-500 mb-2 flex items-center gap-2 whitespace-nowrap"><Sparkles size={18}/> Generate {cardCount} Cards</label>
                   <Input 
                     autoFocus disabled={isGeneratingAI} value={aiTopic} onChange={(e) => setAiTopic(e.target.value)}
                     placeholder="e.g., 'World War II History'" 
                     className="h-12 bg-white dark:bg-zinc-950 border-amber-200 dark:border-amber-900 text-sm focus-visible:ring-amber-500 mb-4 text-umber dark:text-zinc-100 rounded-lg"
                   />
                   <div className="flex justify-end gap-2 mt-2">
                     <Button type="button" variant="ghost" onClick={(e) => { e.stopPropagation(); setInputMode(null); }} disabled={isGeneratingAI} className="text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50 font-bold rounded-lg">Cancel</Button>
                     <Button type="submit" disabled={!aiTopic.trim()} className="bg-amber-600 dark:bg-amber-700 text-white hover:bg-amber-700 dark:hover:bg-amber-600 shadow-sm font-bold rounded-lg min-w-[120px]">
                       Generate
                     </Button>
                   </div>
                </form>
              )
            ) : (
              <div className="flex flex-col items-center justify-center min-w-[200px]">
                <Sparkles size={32} className="text-amber-600 dark:text-amber-500 mb-3" />
                <h3 className="font-bold text-base md:text-lg text-umber dark:text-zinc-100 mb-1 whitespace-nowrap">Generate with AI</h3>
                <p className="text-taupe dark:text-zinc-500 text-xs md:text-sm whitespace-nowrap">Describe a topic directly</p>
              </div>
            )}
          </div>
      </div>

      <div className="flex items-center gap-4 w-full py-4"><div className="h-px bg-taupe/30 dark:bg-zinc-800 flex-1"></div><span className="text-xs font-bold text-taupe dark:text-zinc-600 uppercase tracking-widest">OR CREATE FROM SCRATCH</span><div className="h-px bg-taupe/30 dark:bg-zinc-800 flex-1"></div></div>
      
      <Card className="p-6 md:p-8 shadow-sm border-taupe/30 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl">
        <form onSubmit={handleManualCreate}>
          <h3 className="font-bold text-lg md:text-xl text-umber dark:text-zinc-100 border-b border-taupe/20 dark:border-zinc-800 pb-4 mb-6">New Deck Details</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-2">Deck Name *</label>
              <Input type="text" value={deckName} onChange={(e)=>setDeckName(e.target.value)} required placeholder="e.g. Intro to Databases" className="h-12 bg-sand/20 dark:bg-zinc-950 border-taupe/40 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-umber dark:focus-visible:ring-zinc-600 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-2">Description</label>
              <Textarea value={deckDesc} onChange={(e)=>setDeckDesc(e.target.value)} placeholder="What is this deck about?" className="h-24 resize-none bg-sand/20 dark:bg-zinc-950 border-taupe/40 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-umber dark:focus-visible:ring-zinc-600 rounded-lg"></Textarea>
            </div>
          </div>
          <div className="flex justify-end mt-8">
             <Button type="submit" size="lg" disabled={!deckName.trim() || isSaving} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 font-bold px-8 h-12 rounded-xl shadow-md disabled:opacity-50 min-w-[180px]">
                {isSaving ? <RotateCw className="mr-2 animate-spin" size={16} /> : null}
                {isSaving ? "Saving..." : "Save Empty Deck"}
             </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
