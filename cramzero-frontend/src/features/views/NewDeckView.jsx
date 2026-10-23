import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, UploadCloud, Edit3, ArrowLeft, RotateCw, CheckCircle,
  FileText, X, AlertCircle, Layers, Check, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';

export function NewDeckView({ navigateTo, myDecks, setMyDecks, userId, setIsActionLoading, setActionMessage }) {
  // Mode tabs: 'ai' | 'file' | 'manual'
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem('cramzero-mode-tab');
    if (savedTab) {
      sessionStorage.removeItem('cramzero-mode-tab');
      return savedTab;
    }
    return 'ai';
  });

  const [aiTopic, setAiTopic] = useState(() => {
    const prefill = sessionStorage.getItem('cramzero-prefill-topic');
    if (prefill) {
      sessionStorage.removeItem('cramzero-prefill-topic');
      return prefill;
    }
    return '';
  });

  const [cardCount, setCardCount] = useState(10);
  const [cardCountInput, setCardCountInput] = useState('10');

  const handleCardCountChange = (val) => {
    setCardCountInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setCardCount(Math.min(50, Math.max(1, num)));
    }
  };

  const handleCardCountBlur = () => {
    const num = parseInt(cardCountInput, 10);
    if (isNaN(num) || num < 1) {
      setCardCountInput('10');
      setCardCount(10);
    } else if (num > 50) {
      setCardCountInput('50');
      setCardCount(50);
      toast.info('Maximum card count is 50 for optimal AI quality.');
    } else {
      setCardCountInput(String(num));
      setCardCount(num);
    }
  };
  const [deckName, setDeckName] = useState('');
  const [deckDesc, setDeckDesc] = useState('');
  
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatingMode, setGeneratingMode] = useState(''); // 'prompt' | 'file'
  const [progress, setProgress] = useState(0);
  const [previewDeck, setPreviewDeck] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const topicSuggestions = [
    'Cellular Respiration & ATP',
    'Python Data Structures',
    'Cognitive Psychology & Memory',
    'Constitutional Law Principles',
    'Pharmacology & Antibiotics',
    'Microeconomics Supply & Demand'
  ];

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
        toast.success("Deck Saved to Library!", { 
          description: `"${deckPayload.title || 'New Deck'}" is now available in your personal collection.` 
        });
        navigateTo('decks');
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error("Failed to save deck", { description: err.detail || "Server error while saving." });
      }
    } catch (error) {
      toast.error("Failed to save deck", { description: "Please check your backend connection." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualCreate = (e) => {
    e.preventDefault();
    if (!deckName.trim()) return;
    handleSaveToDatabase({
      title: deckName.trim(),
      description: deckDesc.trim() || "",
      visibility: "Private",
      user_id: userId,
      cards: [{ term: 'Sample Term', definition: 'Click edit to customize this card definition.' }]
    });
  };

  const handleGenerateAIDeck = async (e) => {
    if (e) e.preventDefault();
    if (!aiTopic.trim()) return;
    
    setIsGeneratingAI(true);
    setGeneratingMode('prompt');
    setProgress(15);
    const interval = setInterval(() => {
      setProgress(p => p < 90 ? p + Math.floor(Math.random() * 12) + 4 : 90);
    }, 450);
    
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
          setIsGeneratingAI(false);
          toast.success("Flashcards Generated!", { 
            description: `${generatedPreview.cards?.length || 0} cards generated. Review and save below.` 
          });
        }, 400);
      } else {
        const errorData = await response.json().catch(() => ({}));
        clearInterval(interval);
        setIsGeneratingAI(false);
        if (response.status === 429) {
          toast.warning("Daily Limit Reached", { description: errorData.detail || "Daily generation limit reached." });
        } else {
          toast.error("Generation failed", { description: errorData.detail || "Error generating deck." });
        }
      }
    } catch (error) {
      clearInterval(interval);
      setIsGeneratingAI(false);
      toast.error("Connection Error", { description: "Could not connect to the backend server." });
    } 
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) {
      fileInputRef.current?.click();
      return;
    }

    setIsGeneratingAI(true);
    setGeneratingMode('file');
    setProgress(15);
    const interval = setInterval(() => {
      setProgress(p => p < 90 ? p + Math.floor(Math.random() * 12) + 3 : 90);
    }, 450);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
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
          setIsGeneratingAI(false);
          toast.success("Document Analyzed!", { 
            description: `${generatedPreview.cards?.length || 0} cards extracted from your file.` 
          });
        }, 400);
      } else {
        const errorData = await response.json().catch(() => ({}));
        clearInterval(interval);
        setIsGeneratingAI(false);
        if (response.status === 429) {
          toast.warning("Daily Limit Reached", { description: errorData.detail || "Daily generation limit reached." });
        } else {
          toast.error("File processing failed", { description: errorData.detail || "Error processing your document." });
        }
      }
    } catch (error) {
      clearInterval(interval);
      setIsGeneratingAI(false);
      toast.error("Connection Error", { description: "Could not connect to the backend server." });
    }
  };

  // -------------------------------------------------------------
  // PREVIEW SCREEN: Review and save generated flashcards
  // -------------------------------------------------------------
  if (previewDeck) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 animate-in slide-in-from-right-4 duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-stone-200/60 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300/60 text-xs font-bold">
                Generation Ready
              </Badge>
              <span className="text-xs text-taupe dark:text-zinc-500">•</span>
              <span className="text-xs text-taupe dark:text-zinc-400 font-semibold">{previewDeck.cards?.length || 0} Flashcards</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-umber dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <Sparkles className="text-amber-500" size={24} /> Review Flashcards
            </h2>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setPreviewDeck(null)} 
              className="flex-1 sm:flex-none font-semibold text-xs border-stone-200 dark:border-zinc-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 rounded-xl h-11 px-4"
            >
              Discard
            </Button>
            <Button 
              onClick={() => handleSaveToDatabase(previewDeck)} 
              disabled={isSaving} 
              className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl h-11 px-6 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? <RotateCw className="animate-spin" size={15} /> : <CheckCircle size={15} />}
              {isSaving ? "Saving to Library..." : "Save to My Library"}
            </Button>
          </div>
        </div>
        
        {/* Editable Title Card */}
        <Card className="p-5 sm:p-6 shadow-2xs border border-stone-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl">
          <label className="block text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider mb-2">
            Deck Title (You can edit before saving)
          </label>
          <Input 
            value={previewDeck.title} 
            onChange={(e) => setPreviewDeck({...previewDeck, title: e.target.value})}
            className="h-12 text-base sm:text-lg font-bold bg-stone-50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-amber-500 rounded-xl shadow-2xs"
          />
        </Card>

        {/* Generated Cards List */}
        <div>
          <h3 className="font-extrabold text-base md:text-lg text-umber dark:text-zinc-100 mb-3 flex items-center justify-between">
            <span>Generated Cards ({previewDeck.cards?.length || 0})</span>
            <span className="text-xs font-normal text-taupe dark:text-zinc-500">All terms and definitions ready</span>
          </h3>
          <div className="space-y-3">
            {previewDeck.cards?.map((card, i) => (
              <Card key={i} className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 md:gap-6 shadow-2xs border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl">
                <div className="flex-1 md:border-r md:border-stone-200/80 dark:md:border-zinc-800 md:pr-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[11px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-[11px] font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider">Term</p>
                  </div>
                  <p className="text-umber dark:text-zinc-100 font-bold text-sm sm:text-base pl-7">{card.term}</p>
                </div>
                <div className="flex-[2]">
                  <p className="text-[11px] font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider mb-1">Definition</p>
                  <p className="text-stone-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">{card.definition}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE GENERATION LOADING SCREEN
  // -------------------------------------------------------------
  if (isGeneratingAI) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-300 my-auto">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/15 dark:bg-amber-500/25 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-600 dark:text-amber-400 shadow-lg shadow-amber-500/10">
          <RotateCw size={36} className="animate-spin" />
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-umber dark:text-zinc-100 mb-2 tracking-tight">
          {generatingMode === 'file' ? 'Analyzing Document & Extracting Terms...' : 'Zero AI is Building Your Deck...'}
        </h3>
        <p className="text-xs sm:text-sm text-taupe dark:text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
          {generatingMode === 'file' 
            ? 'Reading file contents, identifying core concepts, and drafting precise recall flashcards with failover protection.' 
            : `Synthesizing ${cardCount} flashcards with clear definitions, context, and key terms.`}
        </p>

        <div className="w-full max-w-md space-y-2">
          <div className="flex justify-between text-xs font-bold text-amber-800 dark:text-amber-400">
            <span>Synthesizing Cards</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5 [&>div]:bg-amber-500 rounded-full" />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN CREATION INTERFACE: 3-Tab Selector
  // -------------------------------------------------------------
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-stone-200/60 dark:border-zinc-800/80">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateTo('decks')} 
            className="-ml-3 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 font-semibold mb-1"
          >
            <ArrowLeft size={16} className="mr-1.5" /> Back to Library
          </Button>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-umber dark:text-zinc-100 tracking-tight">
            Create Flashcard Deck
          </h2>
          <p className="text-xs sm:text-sm text-taupe dark:text-zinc-400 mt-0.5">
            Choose your preferred creation method below to build your study collection.
          </p>
        </div>
      </div>

      {/* 3-Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-stone-200/50 dark:bg-zinc-900/90 rounded-2xl border border-stone-200/80 dark:border-zinc-800/80">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'ai'
              ? 'bg-white text-umber dark:bg-zinc-800 dark:text-zinc-100 shadow-xs'
              : 'text-taupe hover:text-umber dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <Sparkles size={16} className={activeTab === 'ai' ? 'text-amber-500' : ''} />
          <span>AI Topic</span>
        </button>

        <button
          onClick={() => setActiveTab('file')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'file'
              ? 'bg-white text-umber dark:bg-zinc-800 dark:text-zinc-100 shadow-xs'
              : 'text-taupe hover:text-umber dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <UploadCloud size={16} className={activeTab === 'file' ? 'text-blue-500' : ''} />
          <span>Upload File</span>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'manual'
              ? 'bg-white text-umber dark:bg-zinc-800 dark:text-zinc-100 shadow-xs'
              : 'text-taupe hover:text-umber dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <Edit3 size={16} className={activeTab === 'manual' ? 'text-stone-700 dark:text-zinc-300' : ''} />
          <span>Manual Setup</span>
        </button>
      </div>

      {/* TAB 1: AI TOPIC GENERATOR */}
      {activeTab === 'ai' && (
        <Card className="rounded-3xl border border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/20 dark:via-zinc-900 dark:to-zinc-900 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleGenerateAIDeck} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-umber dark:text-zinc-100">
                  Instant AI Flashcard Generator
                </h3>
                <p className="text-xs text-taupe dark:text-zinc-400">
                  Type any study subject or concept to synthesize a ready-to-study deck.
                </p>
              </div>
            </div>

            {/* Topic Input */}
            <div>
              <label className="block text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider mb-2">
                Study Topic or Keyword *
              </label>
              <div className="relative">
                <Input 
                  value={aiTopic} 
                  onChange={(e) => setAiTopic(e.target.value)} 
                  placeholder="e.g., 'Cellular Respiration and Krebs Cycle' or 'Python Object-Oriented Programming'" 
                  className="h-12 pl-4 pr-10 text-sm sm:text-base bg-white dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-amber-500 rounded-xl shadow-2xs"
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

            {/* Quick Topic Chips */}
            <div>
              <p className="text-[11px] font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-2">
                Need inspiration? Click a popular topic:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topicSuggestions.map((topic, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAiTopic(topic)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 dark:bg-zinc-800 dark:hover:bg-amber-950/60 text-stone-700 dark:text-zinc-300 hover:text-amber-900 dark:hover:text-amber-300 border border-stone-200/60 dark:border-zinc-700 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Count Selector - Simple Input */}
            <div>
              <label className="block text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider mb-2">
                Number of Cards (1-50)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={cardCountInput}
                  onChange={(e) => handleCardCountChange(e.target.value)}
                  onBlur={handleCardCountBlur}
                  placeholder="e.g. 10"
                  className="h-10 w-24 text-center font-bold text-sm bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-700 text-umber dark:text-zinc-100 rounded-xl focus-visible:ring-amber-500 shadow-2xs"
                />
                <span className="text-xs font-medium text-taupe dark:text-zinc-400">cards</span>
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  (Max 50 for optimal AI quality)
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200/60 dark:border-zinc-800/80">
              <span className="text-xs text-taupe dark:text-zinc-400">
                Generates {cardCount} flashcards with definitions
              </span>
              
              <Button 
                type="submit" 
                disabled={!aiTopic.trim()} 
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl h-11 px-7 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles size={16} /> Generate {cardCount} Flashcards
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: FILE UPLOAD */}
      {activeTab === 'file' && (
        <Card className="rounded-3xl border border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-b from-blue-50/40 via-white to-white dark:from-blue-950/20 dark:via-zinc-900 dark:to-zinc-900 p-6 sm:p-8 shadow-xs">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept=".pdf,.pptx,.txt" 
            className="hidden" 
          />

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <UploadCloud size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-umber dark:text-zinc-100">
                  Import Notes & Lecture Slides
                </h3>
                <p className="text-xs text-taupe dark:text-zinc-400">
                  Upload a PDF, PowerPoint (.pptx), or text file to extract cards automatically.
                </p>
              </div>
            </div>

            {/* File Dropzone Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 sm:p-10 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                selectedFile 
                  ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30' 
                  : 'border-stone-300 dark:border-zinc-800 hover:border-blue-400 bg-white dark:bg-zinc-950/50'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <FileText size={28} />
              </div>
              {selectedFile ? (
                <div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 text-xs font-bold mb-1">
                    File Selected
                  </Badge>
                  <p className="font-bold text-sm sm:text-base text-umber dark:text-zinc-100">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-taupe dark:text-zinc-400 mt-1">
                    {(selectedFile.size / 1024).toFixed(1)} KB · Click to choose a different file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-sm sm:text-base text-umber dark:text-zinc-100 mb-1">
                    Click to browse or drop your file here
                  </p>
                  <p className="text-xs text-taupe dark:text-zinc-400 max-w-sm mx-auto">
                    Supports PDF documents (.pdf), PowerPoint slide decks (.pptx), and plain text notes (.txt).
                  </p>
                </div>
              )}
            </div>

            {/* Format Badges and Failover Notice */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-stone-100 dark:bg-zinc-800/60 border border-stone-200/60 dark:border-zinc-700/60">
              <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-zinc-300">
                <Info size={14} className="text-blue-500 shrink-0" />
                <span>Supported: <strong>PDF, PPTX, TXT</strong> (up to 20MB)</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check size={12} strokeWidth={3} /> Gemini & Groq Failover Enabled
              </span>
            </div>

            {/* Card Count Selector - Simple Input */}
            <div>
              <label className="block text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider mb-2">
                Number of Cards to Extract (1-50)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={cardCountInput}
                  onChange={(e) => handleCardCountChange(e.target.value)}
                  onBlur={handleCardCountBlur}
                  placeholder="e.g. 10"
                  className="h-10 w-24 text-center font-bold text-sm bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-700 text-umber dark:text-zinc-100 rounded-xl focus-visible:ring-blue-500 shadow-2xs"
                />
                <span className="text-xs font-medium text-taupe dark:text-zinc-400">cards</span>
                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  (Max 50 for optimal AI quality)
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-3 flex justify-end border-t border-stone-200/60 dark:border-zinc-800/80">
              <Button 
                onClick={handleProcessFile} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-11 px-7 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <UploadCloud size={16} />
                {selectedFile ? `Analyze File & Generate ${cardCount} Cards` : 'Choose File to Process'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: MANUAL DECK SETUP */}
      {activeTab === 'manual' && (
        <Card className="p-6 sm:p-8 shadow-xs border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl">
          <form onSubmit={handleManualCreate} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                <Edit3 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-umber dark:text-zinc-100">
                  Manual Deck Setup
                </h3>
                <p className="text-xs text-taupe dark:text-zinc-400">
                  Create a custom blank deck and add cards one-by-one.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Deck Title *
                </label>
                <Input 
                  type="text" 
                  value={deckName} 
                  onChange={(e) => setDeckName(e.target.value)} 
                  required 
                  placeholder="e.g. Constitutional Law Principles" 
                  className="h-12 bg-stone-50/50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-amber-500 rounded-xl" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Description (Optional)
                </label>
                <Textarea 
                  value={deckDesc} 
                  onChange={(e) => setDeckDesc(e.target.value)} 
                  placeholder="Briefly describe what this deck covers..." 
                  className="h-24 resize-none bg-stone-50/50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-amber-500 rounded-xl text-sm" 
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t border-stone-200/60 dark:border-zinc-800/80">
              <Button 
                type="submit" 
                disabled={!deckName.trim() || isSaving} 
                className="w-full sm:w-auto bg-umber dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-umber/90 dark:hover:bg-zinc-200 font-bold px-7 h-11 rounded-xl shadow-xs disabled:opacity-50 min-w-[160px]"
              >
                {isSaving ? <RotateCw className="mr-2 animate-spin" size={16} /> : null}
                {isSaving ? "Creating..." : "Create Empty Deck"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
