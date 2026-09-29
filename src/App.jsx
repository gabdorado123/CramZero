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

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Toaster, toast } from 'sonner';

// Chat UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Message, MessageAvatar, MessageContent, MessageFooter } from "@/components/ui/message";
import ReactMarkdown from 'react-markdown';
import { CodeSpaceView } from '@/features/codespace/CodeSpaceView';
import { PrimaryNavigation } from '@/components/layout/PrimaryNavigation';
import { LandingPageView } from '@/features/views/LandingPageView';
import { DashboardView } from '@/features/views/DashboardView';
import { StudyView } from '@/features/views/StudyView';
import { DecksView } from '@/features/views/DecksView';
import { AnalyticsView } from '@/features/views/AnalyticsView';
import { StudyHubsView } from '@/features/views/StudyHubsView';
import { CreateHubView } from '@/features/views/CreateHubView';
import { HubDetailsView } from '@/features/views/HubDetailsView';
import { NewDeckView } from '@/features/views/NewDeckView';
import { DeckDetailsView } from '@/features/views/DeckDetailsView';
import { FlashcardModeView } from '@/features/views/FlashcardModeView';
import { QuizSetupView } from '@/features/views/QuizSetupView';
import { MockExamSetupView } from '@/features/views/MockExamSetupView';
import { MockExamActiveView } from '@/features/views/MockExamActiveView';
import { MultiplayerView } from '@/features/views/MultiplayerView';

// --- MOCK DATA FOR HUBS AND COMMUNITY ---
const communityDatabase = [
  { id: 'comm-1', title: 'Advanced Data Structures', createdAt: '3 weeks ago', visibility: 'Community', type: 'saved', author: 'CS_Guru99', cards: Array(45).fill({ term: 'Concept', definition: 'Community generated definition.' }) },
  { id: 'comm-2', title: 'NCLEX Pharmacology Master', createdAt: '1 month ago', visibility: 'Community', type: 'saved', author: 'NurseRatched', cards: Array(120).fill({ term: 'Medication', definition: 'Community generated definition.' }) },
  { id: 'comm-3', title: 'JLPT N1 Vocabulary', createdAt: '2 days ago', visibility: 'Community', type: 'saved', author: 'TokyoStudent', cards: Array(85).fill({ term: 'Kanji', definition: 'Community generated definition.' }) }
];

const mockHubs = [
  { id: 'hub-1', name: 'BSIT 3A Core Subjects', description: 'Information Technology Section 3A Shared Resources', role: 'Admin', members: 38, decks: 14, inviteCode: 'BSIT-3A-26' },
  { id: 'hub-2', name: 'Web Dev Portfolio Prep', description: 'Frontend, Backend, and Full-Stack interview prep.', role: 'Member', members: 12, decks: 5, inviteCode: 'WEB-DEV-99' }
];

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('room')) {
      return 'multiplayer';
    }
    return 'landing';
  });
  
  // --- GLOBAL STATE ---
  const [isBooting, setIsBooting] = useState(true); 
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  
  const [myDecks, setMyDecks] = useState([]);
  const [myHubs, setMyHubs] = useState(mockHubs);
  const [activeDeck, setActiveDeck] = useState(null);
  const [activeHub, setActiveHub] = useState(null);
  const [hasActiveDeck, setHasActiveDeck] = useState(false);
  
  const [examConfig, setExamConfig] = useState({ count: 10, timeMode: 'No Limit', isMock: false });

  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isTutorExpanded, setIsTutorExpanded] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // --- DARK MODE STATE & EFFECT ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cramzero-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cramzero-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cramzero-theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (activeDeck) {
      setChatMessages([{ role: 'ai', content: `I see you are studying ${activeDeck.title}. Want me to explain any confusing terms?` }]);
    } else {
      setChatMessages([{ role: 'ai', content: `Hello! I'm Zero, your study assistant. Ask me anything about your notes or open a deck to get started!` }]);
    }
  }, [activeDeck]);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);
    
    const contextStr = activeDeck && activeDeck.cards && activeDeck.cards.length > 0 
      ? activeDeck.cards.map((c, i) => `Card ${i + 1} -> Term: "${c.term}" | Definition: "${c.definition}"`).join('\n') 
      : "No specific deck currently open.";

    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, context: contextStr })
      });
      
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', content: "Sorry, my servers are a bit overloaded right now." }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', content: "Connection error. Please check your backend server." }]);
    } finally {
      setIsChatLoading(false);
    }
  };
  
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/decks/')
      .then(res => res.json())
      .then(data => {
        setMyDecks(data.reverse());
        setTimeout(() => setIsBooting(false), 800);
      })
      .catch(err => {
        console.error("Backend offline or error:", err);
        setTimeout(() => setIsBooting(false), 800);
      });
  }, []);

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0; 
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech is not supported in this browser.");
    }
  };
  
  const handleNavigate = (view) => {
    if (!document.startViewTransition) {
      setCurrentView(view);
    } else {
      document.startViewTransition(() => {
        flushSync(() => {
          setCurrentView(view);
        });
      });
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'study', label: 'Study', icon: BookOpen },
    { id: 'decks', label: 'Library', icon: Library },
    { id: 'hubs', label: 'Hubs', icon: Share2 },
    { id: 'analytics', label: 'Stats', icon: BarChart2 },
    { id: 'multiplayer', label: 'Play', icon: Zap },
    { id: 'codespace', label: 'CodeSpace', icon: Code },
  ];

  const focusViews = ['new-deck', 'deck-details', 'create-hub', 'hub-details', 'flashcard-mode', 'quiz-setup', 'mock-exam-setup', 'mock-exam-active'];
  const showNavDock = !focusViews.includes(currentView);

  if (currentView === 'landing') {
    return (
      <>
        <LandingPageView navigateTo={handleNavigate} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        {isBooting && (
          <div className="fixed inset-0 z-[100] bg-sand dark:bg-zinc-950 flex flex-col items-center justify-center animate-in fade-in duration-200">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-amber-200 dark:bg-amber-900 blur-xl rounded-full animate-pulse"></div>
              <div className="w-20 h-20 bg-white dark:bg-zinc-900 border border-taupe/20 dark:border-zinc-800 rounded-3xl shadow-xl flex items-center justify-center relative z-10 animate-bounce">
                <BookOpen size={40} className="text-umber dark:text-zinc-100" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg z-20">
                <RotateCw size={16} className="text-white animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-umber dark:text-zinc-100 mb-2 tracking-tight">CramZero is cooking  🍳</h2>
            <p className="text-taupe dark:text-zinc-400 text-sm font-medium animate-pulse">Firing up the engines</p>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-sand dark:bg-zinc-950 text-umber dark:text-zinc-100 relative transition-colors">
      
      <Toaster 
        position="top-center" 
        theme={isDarkMode ? 'dark' : 'light'}
        toastOptions={{
          classNames: {
            toast: "group flex w-full items-start gap-4 rounded-3xl border border-taupe/30 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl max-w-md mx-auto animate-in slide-in-from-top-4",
            title: "text-lg font-black text-umber dark:text-zinc-100",
            description: "text-sm font-medium text-taupe dark:text-zinc-400 mt-1 leading-relaxed",
            icon: "mt-0.5 w-6 h-6 group-data-[type=error]:text-rose-500 group-data-[type=success]:text-emerald-500 group-data-[type=info]:text-amber-500",
          },
        }}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden"> 
        <header className="px-4 md:px-6 py-3 border-b border-taupe/20 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-20 transition-colors shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-6 min-w-0">
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => handleNavigate('landing')}>
                <div className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-950 p-1.5 rounded-xl group-hover:scale-105 transition-transform">
                  <BookOpen size={20} fill="currentColor" />
                </div>
                <h1 className="text-xl font-bold text-umber dark:text-zinc-100 hidden sm:block tracking-tight">CramZero</h1>
              </div>
              <div className="h-6 w-px bg-taupe/30 dark:bg-zinc-800 hidden sm:block"></div>
              <h2 className="text-lg md:text-xl font-bold text-umber dark:text-zinc-100 capitalize truncate">
                {currentView === 'new-deck' ? 'Create New Deck' : currentView.replace('-', ' ')}
              </h2>
            </div>
            {showNavDock && (
              <PrimaryNavigation items={navItems} currentView={currentView} onNavigate={handleNavigate} />
            )}
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand/50 dark:bg-zinc-900 border border-taupe/20 dark:border-zinc-800 transition-colors">
                <Sun size={14} className="text-amber-600 dark:text-zinc-500" />
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} className="data-[state=checked]:bg-indigo-500" />
                <Moon size={14} className="text-taupe dark:text-indigo-400" />
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleNavigate('landing')} className="text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 font-bold hidden sm:flex">
                Exit Workspace
              </Button>
            </div>
          </div>

        </header>

        <div key={currentView} className={`flex-1 overflow-y-auto p-4 md:p-8 w-full animate-in fade-in duration-500 ${!showNavDock ? 'pb-0 md:pb-0 p-0 md:p-0' : ''}`}>
          {/* Main Views */}
          {currentView === 'dashboard' && <DashboardView navigateTo={handleNavigate} setHasActiveDeck={setHasActiveDeck} myDecks={myDecks} />}
          {currentView === 'study' && <StudyView navigateTo={handleNavigate} hasActiveDeck={hasActiveDeck} setHasActiveDeck={setHasActiveDeck} setActiveDeck={setActiveDeck} myDecks={myDecks} />}
          {currentView === 'decks' && <DecksView navigateTo={handleNavigate} setActiveDeck={setActiveDeck} myDecks={myDecks} setMyDecks={setMyDecks} />}
          {currentView === 'hubs' && <StudyHubsView navigateTo={handleNavigate} setActiveHub={setActiveHub} myHubs={myHubs} />}
          {currentView === 'analytics' && <AnalyticsView myDecks={myDecks} />}
          {currentView === 'new-deck' && <NewDeckView navigateTo={handleNavigate} myDecks={myDecks} setMyDecks={setMyDecks} setIsActionLoading={setIsActionLoading} setActionMessage={setActionMessage} />}
          {currentView === 'multiplayer' && <MultiplayerView navigateTo={handleNavigate} myDecks={myDecks} />}
          {currentView === 'codespace' && <CodeSpaceView navigateTo={handleNavigate} />}
          
          {/* Sub Views */}
          {currentView === 'create-hub' && <CreateHubView navigateTo={handleNavigate} myHubs={myHubs} setMyHubs={setMyHubs} setIsActionLoading={setIsActionLoading} setActionMessage={setActionMessage} />}
          {currentView === 'hub-details' && <HubDetailsView navigateTo={handleNavigate} activeHub={activeHub} setActiveDeck={setActiveDeck} />}
          {currentView === 'deck-details' && <DeckDetailsView navigateTo={handleNavigate} activeDeck={activeDeck} setIsTutorOpen={setIsTutorOpen} />}
          {currentView === 'flashcard-mode' && <FlashcardModeView navigateTo={handleNavigate} activeDeck={activeDeck} setIsTutorOpen={setIsTutorOpen} />}
          
          {/* Wired Active Assessment Views */}
          {currentView === 'quiz-setup' && <QuizSetupView navigateTo={handleNavigate} setExamConfig={setExamConfig} />}
          {currentView === 'mock-exam-setup' && <MockExamSetupView navigateTo={handleNavigate} activeDeck={activeDeck} setExamConfig={setExamConfig} />}
          {currentView === 'mock-exam-active' && <MockExamActiveView navigateTo={handleNavigate} activeDeck={activeDeck} examConfig={examConfig} />}
        </div>
      </main>

      {/* Action Overlays for major creations */}
      {(isBooting || isActionLoading) && (
        <div className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse"></div>
            <Card className="w-24 h-24 border-taupe/20 dark:border-zinc-800 shadow-2xl flex items-center justify-center relative z-10 animate-bounce bg-background rounded-3xl">
              <BookOpen size={48} className="text-umber dark:text-zinc-100" />
            </Card>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg z-20">
              <RotateCw size={20} className="text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3 tracking-tight">CramZero is cooking... 🍳</h2>
          <p className="text-muted-foreground text-base font-medium animate-pulse">{actionMessage || 'Organizing your workspace'}</p>
        </div>
      )}

      {/* Floating AI Tutor Button */}
      {['flashcard-mode', 'deck-details', 'study', 'mock-exam-active'].includes(currentView) && (activeDeck || hasActiveDeck) && !isTutorOpen && (
        <button onClick={() => setIsTutorOpen(true)} className="fixed bottom-4 md:bottom-8 right-4 md:right-8 p-3.5 md:p-4 bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-950 rounded-full shadow-xl hover:scale-105 transition-all z-40 flex items-center justify-center animate-in zoom-in duration-300 group">
          <MessageCircle size={26} />
          <span className="absolute top-2 right-2 md:top-3 md:right-3 w-3 h-3 bg-emerald-500 border-2 border-umber dark:border-zinc-100 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Professor AI Chat Window */}
      {['flashcard-mode', 'deck-details', 'study', 'mock-exam-active'].includes(currentView) && (activeDeck || hasActiveDeck) && isTutorOpen && (
        <>
          {isTutorExpanded && <div className="fixed inset-0 bg-umber/20 dark:bg-black/50 backdrop-blur-sm z-[55] animate-in fade-in duration-300" onClick={() => setIsTutorExpanded(false)} />}
          <aside className={`fixed bg-white dark:bg-zinc-950 border border-taupe/30 dark:border-zinc-800 shadow-2xl flex flex-col z-[60] overflow-hidden transition-all duration-300 ease-in-out ${isTutorExpanded ? 'inset-4 md:inset-10 lg:inset-x-[15%] lg:inset-y-10 rounded-3xl' : 'bottom-4 right-4 left-4 md:left-auto md:bottom-8 md:right-8 md:w-[400px] h-[500px] md:h-[600px] rounded-2xl animate-in slide-in-from-bottom-6'}`}>
            
            <div className="p-4 border-b border-taupe/30 dark:border-zinc-800 bg-greige/40 dark:bg-zinc-900 flex justify-between items-start shrink-0">
              <div>
                <h3 className="font-bold text-umber dark:text-zinc-100 flex items-center gap-2 text-base md:text-lg"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>Zero AI</h3>
                <p className="text-xs text-taupe dark:text-zinc-400 mt-1 ml-4 font-medium">Vocal Language Partner & Tutor</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsTutorExpanded(!isTutorExpanded)} className="text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 transition-colors p-1.5 rounded hover:bg-taupe/20 dark:hover:bg-zinc-800">
                  {isTutorExpanded ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
                <button onClick={() => { setIsTutorOpen(false); setIsTutorExpanded(false); }} className="text-taupe dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30"><X size={18} /></button>
              </div>
            </div>
            
            <div className={`flex-1 overflow-y-auto bg-greige/10 dark:bg-zinc-900/50 flex flex-col ${isTutorExpanded ? 'p-6 md:p-8' : 'p-4 md:p-5'}`}>
              <div className="flex w-full flex-col gap-6">
                {chatMessages.map((msg, idx) => (
                  <Message key={idx} align={msg.role === 'user' ? 'end' : 'start'} className="w-full">
                    <MessageAvatar className="shrink-0 mt-auto">
                      <Avatar className="w-8 h-8 md:w-9 md:h-9 shadow-sm border border-taupe/20 dark:border-zinc-700">
                        <AvatarFallback className={`w-full h-full flex items-center justify-center font-bold text-[10px] md:text-xs rounded-full ${msg.role === 'ai' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-500' : 'bg-umber dark:bg-zinc-200 text-sand dark:text-zinc-900'}`}>
                          {msg.role === 'user' ? 'ME' : 'AI'}
                        </AvatarFallback>
                      </Avatar>
                    </MessageAvatar>
                    
                    <MessageContent className="max-w-[85%] md:max-w-[75%]">
                      <div className={`relative px-4 py-3 md:px-5 md:py-4 shadow-sm ${msg.role === 'user' ? 'bg-umber dark:bg-zinc-200 text-sand dark:text-zinc-900 rounded-3xl rounded-br-sm' : 'bg-white dark:bg-zinc-800 border border-taupe/20 dark:border-zinc-700 text-umber dark:text-zinc-100 rounded-3xl rounded-bl-sm'}`}>
                        <div className="whitespace-pre-wrap break-words text-[13px] md:text-sm leading-relaxed space-y-3">
                          <ReactMarkdown 
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-lg font-bold border-b border-black/10 dark:border-white/10 pb-1 mt-4 mb-2" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-base font-bold mt-3 mb-2" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-sm font-bold uppercase tracking-wider mt-3 mb-1" {...props} />,
                              p: ({node, ...props}) => <p className="leading-relaxed" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                              code: ({node, inline, ...props}) => 
                                inline ? <code className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-[13px]" {...props} /> 
                                       : <code className="block bg-black/10 dark:bg-white/10 p-3 rounded-lg text-[13px] overflow-x-auto my-2" {...props} />
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                        
                        {msg.role === 'ai' && (
                          <div className="flex justify-end mt-2 -mb-1 -mr-1">
                            <button onClick={() => handleSpeak(msg.content)} title="Listen to response" className="cursor-pointer text-taupe dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 bg-greige/30 dark:bg-zinc-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 p-1.5 rounded-full transition-all border border-transparent hover:border-amber-200 dark:hover:border-amber-800">
                              <Volume2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </MessageContent>
                  </Message>
                ))}

                {isChatLoading && (
                  <Marker role="status" className="mt-2">
                    <MarkerContent className="shimmer text-xs dark:text-zinc-400">
                      <span className="font-medium text-amber-600 dark:text-amber-500">Zero AI</span> is thinking...
                    </MarkerContent>
                  </Marker>
                )}
              </div>
            </div>
            
            <div className={`bg-white dark:bg-zinc-950 border-t border-taupe/20 dark:border-zinc-800 shrink-0 ${isTutorExpanded ? 'p-6' : 'p-3 md:p-4'}`}>
              <div className="flex gap-2 items-end">
                <button className={`rounded-xl transition-all flex items-center justify-center shadow-sm border bg-greige/20 dark:bg-zinc-900 text-taupe dark:text-zinc-400 border-taupe/30 dark:border-zinc-800 ${isTutorExpanded ? 'p-4' : 'p-2.5 md:p-3'}`}>
                  <MicOff size={isTutorExpanded ? 24 : 20} />
                </button>
                <textarea 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                  placeholder="Ask Zero..." 
                  className={`flex-1 bg-greige/10 dark:bg-zinc-900 border border-taupe/30 dark:border-zinc-800 rounded-xl text-umber dark:text-zinc-100 placeholder:text-taupe dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all resize-none ${isTutorExpanded ? 'px-4 py-4 text-base h-[60px] min-h-[60px]' : 'px-3 py-2.5 text-xs md:text-sm h-[42px] min-h-[42px]'}`}
                />
                <button onClick={handleSendChat} disabled={isChatLoading || !chatInput.trim()} className={`bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 rounded-xl hover:bg-umber/90 dark:hover:bg-zinc-300 transition-all flex items-center justify-center shadow-sm disabled:opacity-50 ${isTutorExpanded ? 'p-4' : 'p-2.5 md:p-3'}`}>
                  <Send size={isTutorExpanded ? 22 : 18} />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}


