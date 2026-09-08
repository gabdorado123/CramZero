import { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Clock, FileText, Send, ChevronLeft, ChevronRight, RotateCw, Menu, X, 
  MessageCircle, UploadCloud, Sparkles, Home, Library, Users, BarChart2, Play, Plus, 
  ArrowLeft, Mic, MicOff, Volume2, Settings, Edit3, Trash2, HelpCircle, CheckCircle, 
  Search, Layers, Brain, Zap, MessageSquare, TrendingUp, Calendar, Target,
  Shuffle, Maximize, Minimize, RotateCcw, Star, Check, ArrowRight, ShieldCheck, Award, Code, Cpu,
  Download, Share2, Timer, PieChart, Activity, AlertTriangle, Link as LinkIcon, Inbox,
  Sun, Moon
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
  const [currentView, setCurrentView] = useState('landing');
  
  // --- GLOBAL STATE ---
  const [isBooting, setIsBooting] = useState(true); 
  const [myDecks, setMyDecks] = useState([]);
  const [myHubs, setMyHubs] = useState(mockHubs);
  const [activeDeck, setActiveDeck] = useState(null);
  const [activeHub, setActiveHub] = useState(null);
  const [hasActiveDeck, setHasActiveDeck] = useState(false);
  
  // Dynamic Exam Configuration State
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

  // Auto-greet when a deck is opened
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
  
  // FETCH DECKS FROM FASTAPI BACKEND ON BOOT
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
  
  // FIXED: CONTINUITY TRANSITION
  // Using native document.startViewTransition creates the smooth morphing effect shown in the video
  const handleNavigate = (view) => {
    if (!document.startViewTransition) {
      setCurrentView(view);
    } else {
      document.startViewTransition(() => {
        setCurrentView(view);
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
      
      {/* Premium Toaster */}
      <Toaster position="top-center" theme={isDarkMode ? 'dark' : 'light'} />

      <main className="flex-1 flex flex-col relative overflow-y-auto"> 
        <header className="px-6 py-4 border-b border-taupe/20 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 transition-colors">
          <div className="flex items-center gap-4 md:gap-6">
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
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand/50 dark:bg-zinc-900 border border-taupe/20 dark:border-zinc-800 transition-colors">
              <Sun size={14} className="text-amber-600 dark:text-zinc-500" />
              <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} className="data-[state=checked]:bg-indigo-500" />
              <Moon size={14} className="text-taupe dark:text-indigo-400" />
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleNavigate('landing')} className="text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 font-bold hidden sm:flex">
              Exit Workspace
            </Button>
          </div>
        </header>

        {/* Dynamic padding container */}
        <div className={`flex-1 p-4 md:p-8 w-full ${showNavDock ? 'pb-32 md:pb-36' : 'pb-12 md:pb-12'}`}>
          {/* Main Views */}
          {currentView === 'dashboard' && <DashboardView navigateTo={handleNavigate} setHasActiveDeck={setHasActiveDeck} myDecks={myDecks} />}
          {currentView === 'study' && <StudyView navigateTo={handleNavigate} hasActiveDeck={hasActiveDeck} setHasActiveDeck={setHasActiveDeck} setActiveDeck={setActiveDeck} myDecks={myDecks} />}
          {currentView === 'decks' && <DecksView navigateTo={handleNavigate} setActiveDeck={setActiveDeck} myDecks={myDecks} setMyDecks={setMyDecks} />}
          {currentView === 'hubs' && <StudyHubsView navigateTo={handleNavigate} setActiveHub={setActiveHub} myHubs={myHubs} />}
          {currentView === 'analytics' && <AnalyticsView myDecks={myDecks} />}
          {currentView === 'new-deck' && <NewDeckView navigateTo={handleNavigate} myDecks={myDecks} setMyDecks={setMyDecks} />}
          {currentView === 'multiplayer' && <MultiplayerView navigateTo={handleNavigate} myDecks={myDecks} />}
          
          {/* Sub Views */}
          {currentView === 'create-hub' && <CreateHubView navigateTo={handleNavigate} myHubs={myHubs} setMyHubs={setMyHubs} />}
          {currentView === 'hub-details' && <HubDetailsView navigateTo={handleNavigate} activeHub={activeHub} setActiveDeck={setActiveDeck} />}
          {currentView === 'deck-details' && <DeckDetailsView navigateTo={handleNavigate} activeDeck={activeDeck} setIsTutorOpen={setIsTutorOpen} />}
          {currentView === 'flashcard-mode' && <FlashcardModeView navigateTo={handleNavigate} activeDeck={activeDeck} setIsTutorOpen={setIsTutorOpen} />}
          
          {/* Wired Active Assessment Views */}
          {currentView === 'quiz-setup' && <QuizSetupView navigateTo={handleNavigate} setExamConfig={setExamConfig} />}
          {currentView === 'mock-exam-setup' && <MockExamSetupView navigateTo={handleNavigate} activeDeck={activeDeck} setExamConfig={setExamConfig} />}
          {currentView === 'mock-exam-active' && <MockExamActiveView navigateTo={handleNavigate} activeDeck={activeDeck} examConfig={examConfig} />}
        </div>
      </main>

      {/* FLOATING BOTTOM NAVIGATION DOCK */}
      {showNavDock && (
        <nav className="fixed bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-taupe/30 dark:border-zinc-800 shadow-2xl rounded-[2rem] p-1.5 md:p-2 flex items-center justify-between w-[95vw] sm:w-[85vw] md:w-max animate-in slide-in-from-bottom-8 duration-500 transition-colors">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex-1 md:flex-none flex flex-col items-center justify-center md:w-[4.5rem] py-2 md:py-2.5 transition-all duration-300 rounded-full
                  ${isActive ? 'bg-greige/40 dark:bg-zinc-800 text-umber dark:text-zinc-100 shadow-sm' : 'bg-transparent text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 hover:bg-greige/20 dark:hover:bg-zinc-800/50'}
                `}
              >
                <item.icon size={isActive ? 20 : 18} className={`mb-0.5 md:mb-1 transition-all ${isActive ? 'text-umber dark:text-zinc-100 scale-110' : 'text-taupe dark:text-zinc-400'}`} />
                <span className={`text-[9px] md:text-[11px] font-bold tracking-wide transition-colors line-clamp-1 truncate w-full text-center px-1 ${isActive ? 'text-umber dark:text-zinc-100' : 'text-taupe dark:text-zinc-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Floating AI Tutor Button */}
      {['flashcard-mode', 'deck-details', 'study', 'mock-exam-active'].includes(currentView) && (activeDeck || hasActiveDeck) && !isTutorOpen && (
        <button onClick={() => setIsTutorOpen(true)} className={`fixed ${showNavDock ? 'bottom-24 md:bottom-8' : 'bottom-6 md:bottom-8'} right-4 md:right-8 p-3.5 md:p-4 bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-950 rounded-full shadow-xl hover:scale-105 transition-all z-40 flex items-center justify-center animate-in zoom-in duration-300 group`}>
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

/* =========================================
   LANDING PAGE COMPONENT
   ========================================= */

function LandingPageView({ navigateTo, isDarkMode, setIsDarkMode }) {
  const [typedText, setTypedText] = useState('');
  const [isBuilding, setIsBuilding] = useState(true);
  const [revealedCount, setRevealedCount] = useState(0);

  const fullPrompt = "Cardiac medications — ACE inhibitors, beta blockers, CCBs...";
  const generatedItems = ["Generated 12 cards", "ACE inhibitors", "Beta blockers", "Calcium channel blockers"];

  useEffect(() => {
    let timeout;
    if (isBuilding) {
      if (typedText.length < fullPrompt.length) {
        timeout = setTimeout(() => setTypedText(fullPrompt.slice(0, typedText.length + 1)), 40);
      } else {
        timeout = setTimeout(() => { setIsBuilding(false); setRevealedCount(1); }, 600);
      }
    } else {
      if (revealedCount < generatedItems.length) {
        timeout = setTimeout(() => setRevealedCount(prev => prev + 1), 400);
      } else {
        timeout = setTimeout(() => { setTypedText(''); setIsBuilding(true); setRevealedCount(0); }, 3000);
      }
    }
    return () => clearTimeout(timeout);
  }, [typedText, isBuilding, revealedCount]);

  return (
    <div className="min-h-screen bg-sand dark:bg-zinc-950 text-umber dark:text-zinc-100 font-sans flex flex-col selection:bg-umber dark:selection:bg-zinc-100 selection:text-sand dark:selection:text-zinc-900 transition-colors">
      <header className="px-4 md:px-8 py-5 flex justify-between items-center w-full border-b border-taupe/20 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2 text-xl md:text-2xl font-black tracking-tight cursor-pointer group" onClick={() => navigateTo('landing')}>
            <div className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 p-1.5 rounded-xl group-hover:scale-105 transition-transform">
              <BookOpen size={20} fill="currentColor" />
            </div>
            CramZero
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-umber/80 dark:text-zinc-300 text-sm">
            <a href="#study-ways" className="hover:text-umber dark:hover:text-zinc-100 transition-colors">Interactive Modes</a>
            <a href="#architecture" className="hover:text-umber dark:hover:text-zinc-100 transition-colors">Ecosystem</a>
            <a href="#faq" className="hover:text-umber dark:hover:text-zinc-100 transition-colors">Architecture & FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand/50 dark:bg-zinc-900 border border-taupe/20 dark:border-zinc-800 transition-colors mr-2">
              <Sun size={14} className="text-amber-600 dark:text-zinc-500" />
              <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} className="data-[state=checked]:bg-indigo-500" />
              <Moon size={14} className="text-taupe dark:text-indigo-400" />
            </div>
            <Button variant="ghost" onClick={() => navigateTo('dashboard')} className="font-semibold text-umber/90 dark:text-zinc-300 hover:text-umber dark:hover:text-zinc-100 hidden sm:inline-flex hover:bg-taupe/10 dark:hover:bg-zinc-800">Sign in</Button>
            <Button onClick={() => navigateTo('dashboard')} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 rounded-full font-bold hover:bg-umber/90 dark:hover:bg-zinc-300 shadow-sm hover:scale-105">Launch App →</Button>
          </div>
        </div>
      </header>

      <section className="px-4 md:px-8 py-16 md:py-24 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <Badge variant="outline" className="bg-greige/30 dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 text-umber dark:text-zinc-100 px-3 py-1 font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-600 dark:text-amber-500 mr-2" /> Account-Free & Frictionless
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-umber dark:text-zinc-50">
            Upload files. Generate decks. <span className="text-taupe dark:text-zinc-500 underline decoration-umber/30 dark:decoration-zinc-700">Zero friction.</span>
          </h1>
          <p className="text-base md:text-lg text-taupe dark:text-zinc-400 leading-relaxed font-medium max-w-lg mx-auto lg:mx-0">
            Transform heavy PDFs, PPTX slides, and lecture notes into smart flashcards and quizzes instantly using Google Gemini AI.
          </p>
          <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
            <Button size="lg" onClick={() => navigateTo('dashboard')} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 rounded-xl font-bold text-base hover:bg-umber/90 dark:hover:bg-zinc-300 shadow-md hover:scale-105 h-14 px-8">
              Start Studying Now <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>

        <Card className="lg:col-span-6 rounded-3xl p-6 pt-16 shadow-2xl relative overflow-hidden border-taupe/30 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <Badge className="absolute top-5 right-6 bg-amber-500 hover:bg-amber-500 text-umber dark:text-amber-950 text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest shadow-sm z-10">Live AI Synthesis</Badge>
          <div className="mb-6">
            <span className="text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider block mb-2">GENERATE : PHARMACOLOGY</span>
            <div className="bg-sand/30 dark:bg-zinc-950 border border-taupe/20 dark:border-zinc-800 rounded-xl p-4 font-mono text-sm text-umber dark:text-zinc-300 min-h-[54px] flex items-center">
              <span>{typedText}</span><span className="w-2 h-4 bg-umber dark:bg-zinc-400 ml-1 animate-pulse"></span>
            </div>
          </div>
          <div className="space-y-3 bg-greige/10 dark:bg-zinc-800/50 p-5 rounded-2xl border border-taupe/20 dark:border-zinc-800 min-h-[160px] flex flex-col justify-center">
            {isBuilding ? (
              <div className="flex items-center justify-center gap-2 text-taupe dark:text-zinc-400 text-sm font-medium py-4"><RotateCw size={16} className="animate-spin text-amber-600 dark:text-amber-500" /> Building your deck...</div>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-300">
                {generatedItems.slice(0, revealedCount).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-umber dark:text-zinc-200 font-medium animate-in slide-in-from-bottom-1 duration-200"><Check size={16} className="text-emerald-600 dark:text-emerald-500 shrink-0" /> {item}</div>
                ))}
                {revealedCount >= generatedItems.length && <p className="text-[11px] text-taupe/70 dark:text-zinc-500 pt-1 font-semibold">+ 8 more terms compiled...</p>}
              </div>
            )}
          </div>
        </Card>
      </section>

      <section id="architecture" className="px-4 md:px-8 py-16 md:py-20 max-w-6xl mx-auto w-full">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-umber dark:text-zinc-100">Engineered for absolute retention.</h2>
          <p className="text-taupe dark:text-zinc-400 mt-2 text-sm md:text-base">An entire ecosystem built to eliminate student friction.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-umber dark:bg-zinc-200 text-sand dark:text-zinc-900 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-sand/10 dark:bg-zinc-900/20 text-sand dark:text-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-sand/20 dark:border-zinc-900/30"><UploadCloud size={24} /></div>
              <h3 className="font-bold text-xl md:text-2xl mb-2">Universal Document Ingestion</h3>
              <p className="text-sand/80 dark:text-zinc-800 text-sm md:text-base max-w-lg leading-relaxed">Instantly upload course materials. CramZero's parser extracts definitions, key terms, and generates complete interactive decks automatically.</p>
            </div>
            <div className="mt-8 flex gap-2 md:gap-3 relative z-10 flex-wrap">
              <span className="bg-sand/10 dark:bg-zinc-900/20 border border-sand/20 dark:border-zinc-900/30 px-3 py-1 rounded-lg text-xs font-bold">PDF Support</span>
              <span className="bg-sand/10 dark:bg-zinc-900/20 border border-sand/20 dark:border-zinc-900/30 px-3 py-1 rounded-lg text-xs font-bold">PowerPoint PPTX</span>
              <span className="bg-sand/10 dark:bg-zinc-900/20 border border-sand/20 dark:border-zinc-900/30 px-3 py-1 rounded-lg text-xs font-bold">JSON & TXT</span>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-taupe/20 dark:border-zinc-800 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6"><Share2 size={24} /></div>
              <h3 className="font-bold text-lg md:text-xl text-umber dark:text-zinc-100 mb-2">Collaborative Study Hubs</h3>
              <p className="text-taupe dark:text-zinc-400 text-sm leading-relaxed">Create private classrooms for your section. Invite classmates via link to pool resources and auto-sync shared decks.</p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-taupe/20 dark:border-zinc-800 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-greige/30 dark:bg-zinc-800 text-umber dark:text-zinc-300 rounded-2xl flex items-center justify-center mb-6"><Brain size={24} /></div>
              <h3 className="font-bold text-lg md:text-xl text-umber dark:text-zinc-100 mb-2">Neural Spaced Repetition</h3>
              <p className="text-taupe dark:text-zinc-400 text-sm leading-relaxed">Algorithm schedules reviews dynamically based on your confidence ratings, ensuring long-term mastery.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-umber dark:bg-zinc-900 text-sand dark:text-zinc-100 py-12 md:py-16 px-8 text-center mt-auto border-t border-taupe/20 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          <div className="flex items-center justify-center gap-2 text-2xl font-black">
            <div className="bg-sand dark:bg-zinc-100 text-umber dark:text-zinc-900 p-1.5 rounded-xl"><BookOpen size={20} fill="currentColor" /></div>
            CramZero
          </div>
          <p className="text-sand/70 dark:text-zinc-400 text-xs md:text-sm max-w-md mx-auto">The high-performance study platform built for students who value speed, accuracy, and zero friction.</p>
          <div className="pt-6 md:pt-8 border-t border-sand/10 dark:border-zinc-800 text-xs text-sand/50 dark:text-zinc-500">© 2026 CramZero. Built for modern learners.</div>
        </div>
      </footer>
    </div>
  );
}

/* =========================================
   WORKSPACE VIEWS
   ========================================= */

function DashboardView({ navigateTo, setHasActiveDeck, myDecks }) {
  const handleStartStudying = () => { setHasActiveDeck(true); navigateTo('study'); };
  
  if (myDecks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in duration-300 max-w-6xl mx-auto">
        <Card className="max-w-lg w-full p-12 text-center border-dashed border-taupe/30 dark:border-zinc-800 shadow-none bg-transparent">
          <div className="w-20 h-20 bg-greige/30 dark:bg-zinc-900 text-umber dark:text-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6"><Inbox size={40} /></div>
          <CardTitle className="text-2xl mb-2 text-umber dark:text-zinc-100">Welcome to CramZero!</CardTitle>
          <CardDescription className="text-base mb-8 text-taupe dark:text-zinc-400">Your workspace is currently empty. Create your first deck to unlock insights and begin studying.</CardDescription>
          <Button onClick={() => navigateTo('new-deck')} size="lg" className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 mx-auto font-bold rounded-xl h-14 px-8">
            <Plus size={18} className="mr-2" /> Create First Deck
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12 max-w-6xl mx-auto">
      <Card className="bg-sand/40 dark:bg-zinc-900/40 border-taupe/30 dark:border-zinc-800 shadow-sm">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-umber dark:text-zinc-100 mb-2">Welcome back!</h2>
            <p className="text-taupe dark:text-zinc-400 text-sm md:text-lg">You have {myDecks.length} deck{myDecks.length > 1 ? 's' : ''} to review today. Ready to crush it?</p>
          </div>
          <Button size="lg" onClick={handleStartStudying} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 rounded-xl font-bold h-14 px-8 w-full md:w-auto transition-transform hover:scale-105">
            <Play size={18} fill="currentColor" className="mr-2" /> Resume Last Session
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { title: 'Global Mastery', icon: Brain, val: '0%', sub: 'Avg. confidence rating', color: 'text-emerald-600 dark:text-emerald-500' },
          { title: 'Study Momentum', icon: Zap, val: '0', sub: 'Active days this month', color: 'text-amber-600 dark:text-amber-500' },
          { title: 'Cards Conquered', icon: Target, val: '0', sub: 'Total successful flips', color: 'text-umber dark:text-zinc-100' },
          { title: 'AI Interactions', icon: MessageSquare, val: '0', sub: 'Questions answered by Tutor', color: 'text-blue-600 dark:text-blue-400' },
        ].map((stat, i) => (
          <Card key={i} className="hover:-translate-y-1 transition-transform cursor-default shadow-sm border-taupe/20 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center gap-2 text-taupe dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4"><stat.icon size={16} className={stat.color} /> {stat.title}</div>
              <div><p className="text-3xl font-bold text-umber dark:text-zinc-100 mb-1">{stat.val}</p><p className="text-xs font-semibold text-taupe dark:text-zinc-500">{stat.sub}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StudyView({ navigateTo, setHasActiveDeck, setActiveDeck, myDecks }) {
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
      <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in duration-300 max-w-4xl mx-auto">
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
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
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

      {/* FIXED: Added 'key={activeTab}' to trigger Context Transition natively */}
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

function DecksView({ navigateTo, setActiveDeck, myDecks, setMyDecks }) {
  const [pinnedIds, setPinnedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const handleDeckClick = (deck) => { setActiveDeck(deck); navigateTo('deck-details'); };
  const togglePin = (e, deckId) => { e.stopPropagation(); setPinnedIds(prev => prev.includes(deckId) ? prev.filter(id => id !== deckId) : [...prev, deckId]); };

  const filteredLibrary = myDecks.filter(deck => deck.title.toLowerCase().includes(searchQuery.toLowerCase()) && (activeFilter === 'all' || deck.type === activeFilter));
  const pinnedDecks = filteredLibrary.filter(deck => pinnedIds.includes(deck.id));
  const unpinnedDecks = filteredLibrary.filter(deck => !pinnedIds.includes(deck.id));

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300 pb-12">
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
      
      {/* FIXED: Added 'key' wrappers for Context Transition on filter changes */}
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
          <Card className="border-2 border-dashed border-taupe/30 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 p-12 text-center flex flex-col items-center justify-center animate-in fade-in rounded-3xl">
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

function AnalyticsView({ myDecks }) {
  if (!myDecks || myDecks.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in duration-300 max-w-6xl mx-auto">
          <Card className="max-w-lg w-full p-12 text-center border-dashed border-taupe/30 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 rounded-3xl">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"><PieChart size={32} /></div>
              <CardTitle className="text-xl mb-2 text-umber dark:text-zinc-100">Not enough data yet</CardTitle>
              <CardDescription className="mb-6 max-w-md mx-auto text-taupe dark:text-zinc-400">Complete more study sessions and mock exams to unlock your neural mastery analytics and decay forecasts.</CardDescription>
          </Card>
       </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 pb-12 space-y-6">
      <div className="flex items-center justify-between mb-4 border-b border-taupe/20 dark:border-zinc-800 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-umber dark:text-zinc-100 mb-2">Mastery Analytics</h2>
          <p className="text-taupe dark:text-zinc-400 text-sm">Deep insights into your retention, weak points, and study habits.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-taupe/20 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg text-umber dark:text-zinc-100 flex items-center gap-2"><Timer size={18} className="text-amber-600 dark:text-amber-500"/> Concept Decay Forecast</h3>
              <select className="bg-greige/10 dark:bg-zinc-950 border border-taupe/30 dark:border-zinc-700 text-umber dark:text-zinc-300 text-xs rounded-lg px-2 py-1"><option>Next 7 Days</option><option>Next 30 Days</option></select>
            </div>
            <div className="flex items-end justify-between gap-2 h-48 border-b border-taupe/20 dark:border-zinc-800 pb-2">
              {[0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-greige/30 dark:bg-zinc-800 rounded-t-md transition-all relative" style={{ height: `10%` }}></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider">
              <span>Today</span><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-taupe/20 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardContent className="flex flex-col justify-center text-center items-center py-20 h-full">
            <AlertTriangle size={32} className="text-taupe/50 dark:text-zinc-700 mb-3"/>
            <h3 className="font-bold text-lg text-umber dark:text-zinc-100 mb-1">No Weak Concepts</h3>
            <p className="text-xs text-taupe dark:text-zinc-500">Keep studying to map your weak points.</p>
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-sm overflow-x-auto border-taupe/20 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardContent className="p-6 md:p-8">
          <h3 className="font-bold text-lg text-umber dark:text-zinc-100 flex items-center gap-2 mb-6"><Activity size={18} className="text-emerald-600 dark:text-emerald-500"/> Study Consistency</h3>
          <div className="flex gap-1 min-w-max">
            {[...Array(52)].map((_, col) => (
              <div key={col} className="flex flex-col gap-1">
                {[...Array(7)].map((_, row) => {
                  const intensity = Math.random();
                  let colorClass = intensity > 0.8 ? 'bg-emerald-600 dark:bg-emerald-500' : intensity > 0.5 ? 'bg-emerald-400 dark:bg-emerald-600' : intensity > 0.2 ? 'bg-emerald-200 dark:bg-emerald-800' : 'bg-greige/20 dark:bg-zinc-800';
                  return <div key={row} className={`w-3 h-3 md:w-4 md:h-4 rounded-sm ${colorClass}`}></div>;
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudyHubsView({ navigateTo, setActiveHub, myHubs }) {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-umber dark:text-zinc-100 mb-1">Collaborative Study Hubs</h2>
          <p className="text-taupe dark:text-zinc-400 text-sm">Join classrooms, pool notes, and study together.</p>
        </div>
        <Button onClick={() => navigateTo('create-hub')} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 font-medium rounded-lg h-10 px-4 shadow-sm text-sm">
          <Plus size={18} className="mr-2" /> Create Hub
        </Button>
      </div>

      <Card className="bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 mb-10 shadow-sm text-umber dark:text-zinc-100">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0"><Share2 size={24} /></div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-lg text-umber dark:text-zinc-100 mb-1">Join a Class Hub</h3>
            <p className="text-taupe dark:text-zinc-400 text-sm">Got an invite link or access code? Enter it below.</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <Input type="text" placeholder="e.g. BSIT-3A-26" className="flex-1 md:w-48 bg-white dark:bg-zinc-950 border-taupe/30 dark:border-zinc-800 h-12 rounded-xl text-umber dark:text-zinc-100 focus-visible:ring-blue-400" />
            <Button variant="outline" className="h-12 px-6 rounded-xl font-bold text-umber dark:text-zinc-100 bg-white dark:bg-zinc-900 hover:bg-greige/10 dark:hover:bg-zinc-800 border-taupe/30 dark:border-zinc-700 shadow-sm">Join</Button>
          </div>
        </CardContent>
      </Card>

      {myHubs.length === 0 ? (
        <Card className="border-2 border-dashed border-taupe/30 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 p-12 text-center flex flex-col items-center justify-center animate-in fade-in rounded-3xl">
            <div className="w-16 h-16 bg-greige/30 dark:bg-zinc-800 text-umber dark:text-zinc-400 rounded-full flex items-center justify-center mb-4"><Users size={32} /></div>
            <CardTitle className="text-xl text-umber dark:text-zinc-100 mb-2">No active hubs</CardTitle>
            <CardDescription className="text-taupe dark:text-zinc-400 mb-6 max-w-md mx-auto">Create a new hub to invite classmates or enter an access code above to join an existing one.</CardDescription>
        </Card>
      ) : (
        <>
          <p className="text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-4">Your Active Hubs ({myHubs.length})</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myHubs.map(hub => (
              <Card key={hub.id} onClick={() => { setActiveHub(hub); navigateTo('hub-details'); }} className="bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer relative group flex flex-col justify-between min-h-[180px] rounded-2xl">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-umber dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-4">{hub.name}</h3>
                    <Badge variant={hub.role === 'Admin' ? 'default' : 'secondary'} className={hub.role === 'Admin' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50' : 'bg-greige/30 dark:bg-zinc-800 text-umber dark:text-zinc-300 hover:bg-greige/30 dark:hover:bg-zinc-800 uppercase tracking-widest text-[10px] border-none'}>{hub.role}</Badge>
                  </div>
                  <p className="text-sm text-taupe dark:text-zinc-400 line-clamp-2">{hub.description}</p>
                </CardContent>
                <CardFooter className="pt-4 border-t border-taupe/10 dark:border-zinc-800 text-sm font-medium text-umber dark:text-zinc-300 gap-5 mt-4">
                  <span className="flex items-center gap-1.5"><BookOpen size={16} className="text-taupe dark:text-zinc-500" /> {hub.decks} Decks</span>
                  <span className="flex items-center gap-1.5"><Users size={16} className="text-taupe dark:text-zinc-500" /> {hub.members} Members</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CreateHubView({ navigateTo, myHubs, setMyHubs }) {
  const [selectedDeckOption, setSelectedDeckOption] = useState(null);
  const [hubName, setHubName] = useState('');
  const [hubDesc, setHubDesc] = useState('');
  
  // FIXED: Inline spinner state for creation actions
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    if(!hubName.trim()) return;
    
    setIsCreating(true);
    
    // Simulate network delay to show off inline transition
    setTimeout(() => {
      const newHub = {
        id: `hub-${Date.now()}`,
        name: hubName,
        description: hubDesc || 'No description provided.',
        role: 'Admin',
        members: 1,
        decks: 0,
        inviteCode: Math.floor(100000 + Math.random() * 900000).toString()
      };
      setMyHubs([newHub, ...myHubs]);
      setIsCreating(false);
      
      // Shadcn Premium Toast
      toast.success("Study Hub created!", {
        description: `${hubName} is now ready for collaboration.`
      });
      navigateTo('hubs');
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300 pb-12">
      <Button variant="ghost" onClick={() => navigateTo('hubs')} className="mb-6 -ml-4 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100">
        <ArrowLeft size={18} className="mr-2" /> Back to Hubs
      </Button>
      <Card className="p-8 md:p-10 shadow-sm border-taupe/30 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl">
        <div className="flex items-center gap-4 mb-8 border-b border-taupe/20 dark:border-zinc-800 pb-6">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0"><Users size={24} /></div>
          <div><h2 className="text-2xl font-bold text-umber dark:text-zinc-100">Create a Study Hub</h2><p className="text-taupe dark:text-zinc-400 text-sm">Set up a collaborative space for your class or study group.</p></div>
        </div>
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
          <div>
            <label className="block text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-2">Hub Name *</label>
            <Input type="text" value={hubName} onChange={(e) => setHubName(e.target.value)} placeholder="e.g., BSIT 3A Core Subjects" required className="h-12 text-sm rounded-xl bg-sand/20 dark:bg-zinc-950 border-taupe/40 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-2">Description / Subject Focus</label>
            <Textarea value={hubDesc} onChange={(e) => setHubDesc(e.target.value)} placeholder="What will this group study?" className="h-24 resize-none rounded-xl text-sm bg-sand/20 dark:bg-zinc-950 border-taupe/40 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-blue-400"></Textarea>
          </div>
          <div className="bg-greige/10 dark:bg-zinc-950 p-5 rounded-xl border border-taupe/20 dark:border-zinc-800 space-y-4 mt-6">
            <h4 className="font-bold text-sm text-umber dark:text-zinc-100">Hub Permissions</h4>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-1" />
              <div><p className="text-sm font-bold text-umber dark:text-zinc-100">Allow members to upload decks</p><p className="text-xs text-taupe dark:text-zinc-500 mt-0.5">If unchecked, only Admins can add new material.</p></div>
            </label>
          </div>
          <div className="pt-6 border-t border-taupe/20 dark:border-zinc-800">
            <h4 className="font-bold text-sm text-umber dark:text-zinc-100 mb-4">Initial Shared Deck (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button type="button" onClick={() => setSelectedDeckOption('existing')} className={`p-4 border rounded-xl text-left transition-colors flex flex-col gap-2 ${selectedDeckOption === 'existing' ? 'border-umber dark:border-zinc-500 bg-greige/10 dark:bg-zinc-800 shadow-inner' : 'border-taupe/30 dark:border-zinc-800 hover:bg-greige/10 dark:hover:bg-zinc-800'}`}>
                <div className="flex items-center gap-2 text-umber dark:text-zinc-100 font-bold"><Library size={18} /> Select Existing</div><span className="text-xs text-taupe dark:text-zinc-500">Search from your created or saved decks</span>
              </button>
              <button type="button" onClick={() => setSelectedDeckOption('generate')} className={`p-4 border rounded-xl text-left transition-colors flex flex-col gap-2 ${selectedDeckOption === 'generate' ? 'border-amber-600 dark:border-amber-500 bg-amber-100 dark:bg-amber-900/50 shadow-inner' : 'border-amber-600/30 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-50 dark:hover:bg-amber-900/50'}`}>
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 font-bold"><UploadCloud size={18} /> Generate via File</div><span className="text-xs text-taupe dark:text-zinc-500">Upload .PDF, .PPTX, or .TXT to build</span>
              </button>
            </div>
          </div>
          <div className="pt-6 border-t border-taupe/20 dark:border-zinc-800 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => navigateTo('hubs')} className="px-6 h-12 rounded-xl font-bold text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 hover:bg-greige/20 dark:hover:bg-zinc-800">Cancel</Button>
            <Button type="submit" disabled={!hubName.trim() || isCreating} className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-xl font-bold shadow-sm disabled:opacity-50 min-w-[140px]">
               {isCreating ? <RotateCw className="mr-2 animate-spin" size={16} /> : null}
               {isCreating ? "Creating..." : "Create Hub"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function HubDetailsView({ navigateTo, activeHub }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  if (!activeHub) {
    return (
       <div className="max-w-5xl mx-auto p-12 text-center">
         <h2 className="text-xl font-bold text-umber dark:text-zinc-100">Hub Error</h2>
         <Button onClick={() => navigateTo('hubs')} className="mt-4 bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 rounded-xl h-10 px-4">Return</Button>
       </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300 relative">
      <Button variant="ghost" onClick={() => navigateTo('hubs')} className="mb-6 -ml-4 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100">
        <ArrowLeft size={18} className="mr-2" /> Back to Hubs
      </Button>
      
      <Card className="rounded-3xl p-6 md:p-8 shadow-sm mb-8 relative overflow-hidden bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800">
        <div className="absolute top-0 right-0 p-8 text-taupe/5 dark:text-zinc-800 pointer-events-none"><Users size={150} /></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge className="bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 text-[10px] font-bold uppercase tracking-widest mb-3 border-none">{activeHub.role}</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-umber dark:text-zinc-100 mb-2">{activeHub.name}</h2>
            <p className="text-taupe dark:text-zinc-400 text-sm md:text-base max-w-xl">{activeHub.description}</p>
          </div>
          <div className="bg-sand/40 dark:bg-zinc-950 border border-taupe/30 dark:border-zinc-800 p-4 rounded-xl flex flex-col items-center min-w-[160px]">
            <p className="text-[10px] font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest mb-1">Invite Code</p>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-umber dark:text-zinc-100 tracking-wider">{activeHub.inviteCode}</span>
              <button className="text-taupe dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"><LinkIcon size={16}/></button>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-umber dark:text-zinc-100">Shared Materials</h3>
        <Button onClick={() => setShowUploadModal(true)} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 font-medium rounded-lg h-10 px-4 shadow-sm text-sm">
          <UploadCloud size={16} className="mr-2" /> Upload to Hub
        </Button>
      </div>

      <Card className="border-2 border-dashed border-taupe/30 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 p-12 text-center flex flex-col items-center justify-center animate-in fade-in rounded-3xl">
         <div className="w-16 h-16 bg-greige/30 dark:bg-zinc-800 text-umber dark:text-zinc-400 rounded-full flex items-center justify-center mb-4"><Library size={32} /></div>
         <CardTitle className="text-xl text-umber dark:text-zinc-100 mb-2">No decks shared yet</CardTitle>
         <CardDescription className="text-taupe dark:text-zinc-400 mb-6 max-w-md mx-auto">Be the first to upload study material to this classroom.</CardDescription>
      </Card>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="rounded-3xl p-6 md:p-8 max-w-md w-full shadow-md relative animate-in zoom-in-95 duration-200 bg-white dark:bg-zinc-900 border-taupe/20 dark:border-zinc-800">
            <button onClick={() => setShowUploadModal(false)} className="absolute top-6 right-6 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100"><X size={20} /></button>
            <h3 className="text-xl font-bold text-umber dark:text-zinc-100 mb-2">Share Deck to Hub</h3>
            <p className="text-taupe dark:text-zinc-400 text-sm mb-6">Choose how you want to add study material to {activeHub.name}.</p>
            <div className="space-y-4">
              <button className="w-full p-4 border border-taupe/30 dark:border-zinc-800 rounded-xl hover:bg-greige/10 dark:hover:bg-zinc-800 text-left transition-colors flex items-center gap-4 group">
                <div className="w-10 h-10 bg-greige/20 dark:bg-zinc-950 rounded-lg flex items-center justify-center group-hover:bg-white dark:group-hover:bg-zinc-900 transition-colors"><Library size={20} className="text-umber dark:text-zinc-300"/></div>
                <div><p className="font-bold text-umber dark:text-zinc-100 text-sm">Select Existing Deck</p><p className="text-xs text-taupe dark:text-zinc-500 mt-0.5">Pick from your personal library</p></div>
              </button>
              <button className="w-full p-4 border border-amber-600/30 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/50 text-left transition-colors flex items-center gap-4 group">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/80 rounded-lg flex items-center justify-center transition-colors"><UploadCloud size={20} className="text-amber-600 dark:text-amber-500"/></div>
                <div><p className="font-bold text-amber-800 dark:text-amber-400 text-sm">Generate from File</p><p className="text-xs text-amber-700/70 dark:text-amber-500/70 mt-0.5">Upload PDF/PPTX to auto-build</p></div>
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function NewDeckView({ navigateTo, myDecks, setMyDecks }) {
  const [deckName, setDeckName] = useState('');
  const [deckDesc, setDeckDesc] = useState('');
  const [inputMode, setInputMode] = useState(null); 
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [previewDeck, setPreviewDeck] = useState(null);
  const [cardCount, setCardCount] = useState(10);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  // FIXED: Inline spinner state for creation actions
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
         
         // Shadcn Premium Toast
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
      <div className="max-w-4xl mx-auto animate-in slide-in-from-right-8 duration-300">
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
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300 space-y-6 overflow-x-hidden">
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

function DeckDetailsView({ navigateTo, activeDeck, setIsTutorOpen }) {
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
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
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

function FlashcardModeView({ navigateTo, activeDeck, setIsTutorOpen }) {
  const safeDeck = activeDeck || { cards: [{term: "Loading...", definition: "Please hold."}] };

  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [cardOrder, setCardOrder] = useState(() => [...Array(safeDeck.cards?.length || 1).keys()]);
  const [autoSpeed, setAutoSpeed] = useState(0);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (autoSpeed === 0) { setProgress(0); return; }
    const updateInterval = 50;
    const increment = (updateInterval / (autoSpeed * 1000)) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (!isFlipped) { setIsFlipped(true); return 0; }
          else if (currentIndex < (safeDeck.cards?.length || 1) - 1) { setIsFlipped(false); setCurrentIndex(idx => idx + 1); return 0; }
          else { setAutoSpeed(0); return 0; }
        }
        return prev + increment;
      });
    }, updateInterval);
    return () => clearInterval(timer);
  }, [autoSpeed, isFlipped, currentIndex, safeDeck]);

  const currentCard = safeDeck.cards ? safeDeck.cards[cardOrder[currentIndex]] : {term: "Empty", definition: "Empty"};
  const cycleAutoSpeed = () => { setAutoSpeed(prev => prev === 0 ? 3 : prev === 3 ? 5 : prev === 5 ? 10 : 0); setProgress(0); };
  const handleNext = () => { setIsFlipped(false); setProgress(0); if (currentIndex < (safeDeck.cards?.length || 1) - 1) setCurrentIndex(prev => prev + 1); };
  const handlePrev = () => { setIsFlipped(false); setProgress(0); if (currentIndex > 0) setCurrentIndex(prev => prev - 1); };
  const toggleShuffle = () => {
    if (!isShuffled) setCardOrder([...cardOrder].sort(() => Math.random() - 0.5));
    else setCardOrder([...Array(safeDeck.cards?.length || 1).keys()]);
    setIsShuffled(!isShuffled); setCurrentIndex(0); setIsFlipped(false); setProgress(0);
  };
  const handleReset = () => { setCurrentIndex(0); setIsFlipped(false); setAutoSpeed(0); setProgress(0); setCardOrder([...Array(safeDeck.cards?.length || 1).keys()]); setIsShuffled(false); };
  const toggleFullscreen = () => document.fullscreenElement ? document.exitFullscreen() : containerRef.current?.requestFullscreen().catch(e => console.log(e));

  return (
    <div ref={containerRef} className="max-w-4xl w-full mx-auto flex flex-col items-center animate-in fade-in duration-300 h-full min-h-[500px] bg-white dark:bg-zinc-950 p-4 md:p-6 rounded-2xl relative">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-taupe/20 dark:border-zinc-800 pb-4 shrink-0">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigateTo('deck-details')} className="text-taupe dark:text-zinc-500 hover:text-umber dark:hover:text-zinc-100 hover:bg-greige/20 dark:hover:bg-zinc-800 mr-1"><ArrowLeft size={20}/></Button>
          <div className="flex flex-wrap gap-1.5 sm:border-r sm:border-taupe/20 dark:sm:border-zinc-800 sm:pr-4">
            <Button variant="outline" size="sm" onClick={cycleAutoSpeed} className={`h-8 text-[11px] font-bold uppercase tracking-wider border-taupe/30 dark:border-zinc-700 ${autoSpeed > 0 ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50' : 'text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 hover:bg-greige/20 dark:hover:bg-zinc-800 bg-transparent'}`}><Clock size={13} className="mr-1" /> {autoSpeed > 0 ? `${autoSpeed}s` : 'Auto'}</Button>
            <Button variant="outline" size="sm" onClick={toggleShuffle} className={`h-8 text-[11px] font-bold uppercase tracking-wider border-taupe/30 dark:border-zinc-700 ${isShuffled ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50' : 'text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 hover:bg-greige/20 dark:hover:bg-zinc-800 bg-transparent'}`}><Shuffle size={13} className="mr-1" /> Shuffle</Button>
            <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-[11px] font-bold uppercase tracking-wider text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 hover:bg-greige/20 dark:hover:bg-zinc-800 bg-transparent border-taupe/30 dark:border-zinc-700"><RotateCcw size={13} className="mr-1" /> Reset</Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen} className="hidden md:flex h-8 text-[11px] font-bold uppercase tracking-wider text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 hover:bg-greige/20 dark:hover:bg-zinc-800 bg-transparent border-taupe/30 dark:border-zinc-700"><Maximize size={13} className="mr-1" /> Focus</Button>
          </div>
          <Badge variant="secondary" className="font-bold tracking-wide rounded-lg text-xs bg-greige/20 dark:bg-zinc-800 text-umber dark:text-zinc-300 hover:bg-greige/20 dark:hover:bg-zinc-800 border-none">Card {currentIndex + 1} / {safeDeck.cards?.length || 0}</Badge>
        </div>
        <div>
          <Button onClick={() => setIsTutorOpen(true)} className="h-8 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-800 text-xs font-bold shadow-sm rounded-lg"><HelpCircle size={15} className="mr-1.5" /> Ask AI</Button>
        </div>
      </div>
      <Card onClick={() => { setIsFlipped(!isFlipped); setProgress(0); }} className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl hover:border-taupe/60 dark:hover:border-zinc-600 transition-all duration-300 relative group shadow-sm overflow-hidden p-6 text-center my-auto min-h-[300px] bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 rounded-2xl mb-8">
        <span className="absolute top-4 left-4 text-[10px] md:text-xs font-bold text-taupe dark:text-zinc-500 tracking-widest uppercase">{isFlipped ? "Definition" : "Term"}</span>
        <h3 className="text-xl md:text-3xl font-medium text-umber dark:text-zinc-100 px-4 leading-relaxed">{isFlipped ? currentCard?.definition : currentCard?.term}</h3>
        {autoSpeed === 0 && <Badge className="absolute bottom-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-sand dark:bg-zinc-800 text-taupe dark:text-zinc-400 hover:bg-sand dark:hover:bg-zinc-800 border-none">Click to flip</Badge>}
        {autoSpeed > 0 && (
          <>
            <div className="absolute bottom-4 left-6 text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-2"><RotateCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />{isFlipped ? "Moving to next..." : "Auto-flipping..."}</div>
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-greige/30 dark:bg-zinc-800"><div className="h-full bg-amber-500 dark:bg-amber-600 transition-all ease-linear" style={{ width: `${progress}%`, transitionDuration: '50ms' }}></div></div>
          </>
        )}
      </Card>
      
      {/* Sticky Bottom Navigation for Flashcards */}
      <div className="sticky bottom-0 w-full max-w-2xl bg-white dark:bg-zinc-950 py-4 z-20 flex items-center justify-center shrink-0 border-t border-taupe/10 dark:border-zinc-800/50 mt-auto transition-colors">
        {!isFlipped ? (
          <div className="flex gap-8 md:gap-12 text-taupe dark:text-zinc-500">
            <button onClick={handlePrev} disabled={currentIndex === 0} className="hover:text-umber dark:hover:text-zinc-100 transition-colors disabled:opacity-30"><ChevronLeft size={30}/></button>
            <button onClick={handleNext} disabled={currentIndex === (safeDeck.cards?.length || 1) - 1} className="hover:text-umber dark:hover:text-zinc-100 transition-colors disabled:opacity-30"><ChevronRight size={30}/></button>
          </div>
        ) : (
          <div className="flex gap-2 md:gap-4 w-full animate-in slide-in-from-bottom-2 duration-200">
            <Button onClick={handleNext} className="flex-1 h-12 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl font-bold hover:bg-rose-100 dark:hover:bg-rose-900">Hard (1m)</Button>
            <Button variant="outline" onClick={handleNext} className="flex-1 h-12 rounded-xl font-bold bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-700 text-umber dark:text-zinc-300 hover:bg-greige/10 dark:hover:bg-zinc-800 hover:text-umber dark:hover:text-zinc-100">Good (10m)</Button>
            <Button onClick={handleNext} className="flex-1 h-12 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-xl font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900">Easy (4d)</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTIVE ASSESSMENT ENGINE (DYNAMIC QUIZ & MOCK EXAM VIEW)
// ---------------------------------------------------------------------------

function QuizSetupView({ navigateTo, setExamConfig }) {
  const [qCount, setQCount] = useState(10);

  const handleStart = (isRandom) => {
    setExamConfig({ count: qCount, timeMode: 'No Limit', isMock: false });
    navigateTo('mock-exam-active');
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
      <Button variant="ghost" onClick={() => navigateTo('deck-details')} className="-ml-4 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 mb-6 font-medium">
        <ArrowLeft size={16} className="mr-2" /> Back to Deck
      </Button>
      <h2 className="text-2xl md:text-3xl font-bold text-umber dark:text-zinc-100 mb-2">Configure Challenge</h2>
      <p className="text-taupe dark:text-zinc-400 text-xs md:text-sm mb-6">Select the test parameters for this session.</p>
      
      <Card className="p-6 shadow-sm mb-6 bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 rounded-2xl">
        <h3 className="font-bold text-umber dark:text-zinc-100 mb-4 flex items-center gap-2"><Target size={18}/> Challenge Length</h3>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4">
          {[5, 10, 20, 30, 50].map(num => (
            <Button 
              key={num}
              variant="outline"
              onClick={() => setQCount(num)}
              className={`flex-1 h-12 font-bold text-sm md:text-base border-2 transition-all rounded-xl ${qCount === num ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 dark:border-amber-600 text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:text-amber-800 dark:hover:text-amber-400 scale-[1.02]' : 'bg-greige/10 dark:bg-zinc-800 text-taupe dark:text-zinc-400 hover:bg-greige/20 dark:hover:bg-zinc-700 hover:text-umber dark:hover:text-zinc-100 border-transparent'}`}
            >
              {num} <span className="hidden sm:inline font-semibold ml-1">Qs</span>
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-4 md:p-6 shadow-sm space-y-4 mb-8 bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 rounded-2xl">
        <div className="flex items-start gap-4 p-4 border border-umber dark:border-zinc-600 bg-sand/30 dark:bg-zinc-800 rounded-xl cursor-pointer">
          <div className="mt-1"><div className="w-5 h-5 rounded border-2 border-umber dark:border-zinc-400 flex items-center justify-center"><div className="w-2.5 h-2.5 bg-umber dark:bg-zinc-400 rounded-sm"></div></div></div>
          <div><h4 className="font-bold text-base md:text-lg mb-1 text-umber dark:text-zinc-100">Multiple Choice</h4><p className="text-xs md:text-sm text-umber/80 dark:text-zinc-400">Pick the correct answer from 4 generated options.</p></div>
        </div>
        <div className="flex items-start gap-4 p-4 border border-taupe/20 dark:border-zinc-800 bg-greige/5 dark:bg-zinc-950 rounded-xl cursor-not-allowed opacity-60 text-taupe dark:text-zinc-600">
          <div className="mt-1"><div className="w-5 h-5 rounded border-2 border-taupe/40 dark:border-zinc-700"></div></div>
          <div><h4 className="font-bold text-base md:text-lg mb-1 flex items-center gap-2">True / False <Badge variant="secondary" className="text-[10px] bg-taupe/20 dark:bg-zinc-800 text-taupe dark:text-zinc-500 hover:bg-taupe/20 dark:hover:bg-zinc-800 border-none">Needs 4+ Cards</Badge></h4><p className="text-xs md:text-sm">Evaluate whether an AI-generated statement is correct.</p></div>
        </div>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" onClick={() => handleStart(false)} className="flex-1 h-14 rounded-xl font-bold text-base bg-white dark:bg-zinc-900 border-2 border-taupe/30 dark:border-zinc-800 text-umber dark:text-zinc-300 hover:bg-greige/10 dark:hover:bg-zinc-800 hover:text-umber dark:hover:text-zinc-100">Sequential Order</Button>
        <Button onClick={() => handleStart(true)} className="flex-1 bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 h-14 rounded-xl font-bold text-base shadow-md">Start Randomized</Button>
      </div>
    </div>
  );
}

function MockExamSetupView({ navigateTo, activeDeck, setExamConfig }) {
  const safeDeck = activeDeck || { title: "Loading Assessment..." };
  const [qCount, setQCount] = useState(25);
  const [timeLimit, setTimeLimit] = useState('60 mins');

  const handleStart = () => {
    setExamConfig({ count: qCount, timeMode: timeLimit, isMock: true });
    navigateTo('mock-exam-active');
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
      <Button variant="ghost" onClick={() => navigateTo('deck-details')} className="-ml-4 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 mb-6 font-medium">
        <ArrowLeft size={16} className="mr-2" /> Back to Deck
      </Button>
      <div className="flex items-center gap-4 mb-2">
        <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center"><Timer size={20} /></div>
        <h2 className="text-2xl md:text-3xl font-bold text-umber dark:text-zinc-100">AI Mock Exam Simulator</h2>
      </div>
      <p className="text-taupe dark:text-zinc-400 text-sm mb-8 ml-14">Transform '{safeDeck.title}' into a high-stakes timed assessment.</p>

      <Card className="p-6 md:p-8 shadow-sm space-y-8 mb-8 bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 rounded-2xl">
        <div>
          <h4 className="font-bold text-lg text-umber dark:text-zinc-100 mb-3 flex items-center gap-2">Exam Length</h4>
          <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
            {[10, 25, 50, 75, 100].map(num => (
              <Button 
                key={num}
                variant="outline"
                onClick={() => setQCount(num)}
                className={`flex-1 h-12 border-2 font-bold text-sm md:text-base transition-all rounded-xl ${qCount === num ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-500 dark:border-rose-600 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:text-rose-800 dark:hover:text-rose-300 scale-[1.02]' : 'bg-greige/10 dark:bg-zinc-800 text-taupe dark:text-zinc-400 hover:bg-greige/20 dark:hover:bg-zinc-700 hover:text-umber dark:hover:text-zinc-100 border-transparent'}`}
              >
                {num} <span className="text-xs md:text-sm font-semibold opacity-80 block sm:inline sm:ml-1">Items</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-taupe/20 dark:border-zinc-800">
          <h4 className="font-bold text-lg text-umber dark:text-zinc-100 mb-3 flex items-center gap-2">Time Limit</h4>
          <div className="flex flex-wrap gap-3 mt-4">
            {['15 mins', '30 mins', '60 mins', 'No Limit'].map((time) => (
              <Button 
                key={time} 
                variant="outline" 
                onClick={() => setTimeLimit(time)}
                className={`h-10 rounded-xl font-bold border-2 transition-all ${timeLimit === time ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-500 dark:border-rose-600 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:text-rose-800 dark:hover:text-rose-300 scale-[1.02]' : 'bg-white dark:bg-zinc-950 border-transparent text-taupe dark:text-zinc-400 hover:bg-greige/10 dark:hover:bg-zinc-800 hover:text-umber dark:hover:text-zinc-100'}`}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="pt-6 border-t border-taupe/20 dark:border-zinc-800">
          <h4 className="font-bold text-lg text-umber dark:text-zinc-100 mb-1 flex items-center gap-2">AI Generation Style</h4>
          <div className="space-y-3 mt-4">
            <label className="flex items-start gap-4 p-4 border-2 border-rose-400 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20 rounded-xl cursor-pointer shadow-sm">
              <input type="radio" name="examStyle" defaultChecked className="mt-1 accent-rose-600 dark:accent-rose-500" />
              <div><p className="font-bold text-rose-800 dark:text-rose-400 text-sm">Board Exam Format (Trick Questions)</p><p className="text-xs text-rose-600 dark:text-rose-500/80 mt-1">AI synthesizes multiple cards into complex scenario-based questions with plausible distractors.</p></div>
            </label>
          </div>
        </div>
      </Card>
      
      <Button onClick={handleStart} className="w-full h-14 bg-rose-600 dark:bg-rose-700 text-white rounded-xl font-bold hover:bg-rose-700 dark:hover:bg-rose-600 shadow-md text-base">
        <Play size={18} fill="currentColor" className="mr-2" /> Start {qCount}-Question Simulation
      </Button>
    </div>
  );
}

function MockExamActiveView({ navigateTo, activeDeck, examConfig }) {
  const safeDeck = activeDeck || { title: "Loading Assessment...", cards: [] }; 
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(null);

  useEffect(() => {
    if (!safeDeck.cards || safeDeck.cards.length === 0) return;

    const count = examConfig?.count || 10;
    const isMock = examConfig?.isMock || false;
    const timeMode = examConfig?.timeMode || 'No Limit';

    let shuffledCards = [...safeDeck.cards].sort(() => Math.random() - 0.5);
    let selectedCards = shuffledCards.slice(0, Math.min(count, shuffledCards.length));

    const generatedQs = selectedCards.map(card => {
      let otherCards = safeDeck.cards.filter(c => c.term !== card.term);
      let shuffledOthers = [...otherCards].sort(() => Math.random() - 0.5);
      
      let distractors = shuffledOthers.slice(0, 3).map(c => c.definition);
      
      while (distractors.length < 3) {
         distractors.push(`Generic distractor option for ${card.term} #${Math.floor(Math.random() * 100)}`);
      }
      
      let options = [card.definition, ...distractors].sort(() => Math.random() - 0.5);
      
      return {
        scenario: isMock ? "Scenario Analysis" : "Knowledge Check",
        question: isMock
            ? `Analyze the following concept: "${card.term}". Which of the following statements best defines its core operational mechanism or definition?`
            : `What is the definition of "${card.term}"?`,
        answer: card.definition,
        options: options
      };
    });

    setQuestions(generatedQs);

    if (timeMode !== 'No Limit') {
       const mins = parseInt(timeMode.split(' ')[0]);
       setTimeLeftSeconds(mins * 60);
    } else {
       setTimeLeftSeconds(null);
    }
  }, [safeDeck.cards, examConfig?.count, examConfig?.isMock, examConfig?.timeMode]);

  useEffect(() => {
    if (timeLeftSeconds === null || isFinished) return;
    
    const timerId = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeftSeconds === null, isFinished]); 

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelect = (opt) => {
    if (answers[currentIndex] !== undefined || isFinished) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: opt }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
       setCurrentIndex(prev => prev + 1);
    } else {
       setIsFinished(true);
    }
  };

  if (questions.length === 0) {
      return (
          <div className="max-w-4xl mx-auto p-12 text-center text-taupe dark:text-zinc-500">
             Cannot generate test. The deck is empty.
             <Button onClick={() => navigateTo('deck-details')} className="mt-4 block mx-auto bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900">Return to Deck</Button>
          </div>
      );
  }

  if (isFinished) {
    let finalScore = 0;
    questions.forEach((q, i) => {
        if (answers[i] === q.answer) finalScore++;
    });
    
    const percentage = Math.round((finalScore / questions.length) * 100);
    let feedback = percentage >= 80 ? "Outstanding Mastery!" : percentage >= 60 ? "Good Effort!" : "Keep Reviewing!";

    return (
      <div className="max-w-4xl mx-auto animate-in fade-in duration-500 w-full flex flex-col pb-12">
         <Card className="p-8 md:p-12 text-center bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 shadow-xl rounded-3xl mb-8">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-umber dark:text-zinc-100 mb-2">Assessment Complete</h2>
            <p className="text-taupe dark:text-zinc-400 font-medium text-lg mb-8">{feedback}</p>
            
            <div className="bg-greige/10 dark:bg-zinc-950 border border-taupe/20 dark:border-zinc-800 rounded-2xl p-6 mb-10 max-w-sm mx-auto">
              <p className="text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest mb-1">Final Score</p>
              <div className="flex items-baseline justify-center gap-2 text-umber dark:text-zinc-100">
                 <span className="text-6xl font-black">{finalScore}</span>
                 <span className="text-2xl font-bold text-taupe dark:text-zinc-600">/ {questions.length}</span>
              </div>
              <p className="font-bold text-emerald-600 dark:text-emerald-500 mt-2">{percentage}% Accuracy</p>
            </div>
            
            <Button size="lg" onClick={() => navigateTo('deck-details')} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 font-bold rounded-xl h-14 w-full md:w-auto md:mx-auto px-12 shadow-md">
                 Return to Deck
            </Button>
         </Card>

         <h3 className="font-bold text-xl text-umber dark:text-zinc-100 mb-4 px-2">Question Review</h3>
         <div className="space-y-4 mb-8">
             {questions.map((q, i) => {
                 const isCorrect = answers[i] === q.answer;
                 const isSkipped = !answers[i];
                 return (
                     <Card key={i} className={`p-6 border-l-4 ${isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'} bg-white dark:bg-zinc-900 border-t-taupe/20 border-r-taupe/20 border-b-taupe/20 dark:border-zinc-800 rounded-2xl shadow-sm`}>
                         <div className="flex gap-4">
                           <div className="mt-1">{isCorrect ? <CheckCircle size={20} className="text-emerald-500" /> : <X size={20} className="text-rose-500" />}</div>
                           <div className="flex-1">
                             <p className="font-bold text-umber dark:text-zinc-100 mb-3 text-sm md:text-base leading-relaxed">Q: {q.question}</p>
                             <div className="space-y-1.5 text-xs md:text-sm bg-sand/30 dark:bg-zinc-950 p-4 rounded-xl border border-taupe/20 dark:border-zinc-800">
                                 <p className="text-taupe dark:text-zinc-400 flex flex-col md:flex-row md:items-start gap-1 md:gap-2">
                                   <span className="shrink-0 font-medium">Your Answer:</span> 
                                   <span className={`font-semibold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{isSkipped ? 'Skipped' : answers[i]}</span>
                                 </p>
                                 {!isCorrect && (
                                   <p className="text-taupe dark:text-zinc-400 flex flex-col md:flex-row md:items-start gap-1 md:gap-2 mt-2 pt-2 border-t border-taupe/20 dark:border-zinc-800">
                                     <span className="shrink-0 font-medium">Correct Answer:</span> 
                                     <span className="font-semibold text-emerald-600 dark:text-emerald-400">{q.answer}</span>
                                   </p>
                                 )}
                             </div>
                           </div>
                         </div>
                     </Card>
                 )
             })}
         </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCurrent = answers[currentIndex] !== undefined;

  return (
    <div className="max-w-4xl w-full mx-auto animate-in fade-in duration-300 flex flex-col h-full relative">
      <div className="sticky top-0 z-20 bg-sand/90 dark:bg-zinc-950/90 backdrop-blur-md pt-4 pb-4 mb-6 border-b border-taupe/20 dark:border-zinc-800 flex justify-between items-end transition-colors">
        <div>
          <p className="text-[10px] font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest mb-1">
            {examConfig?.isMock ? 'Mock Exam' : 'Knowledge Check'} • Question {currentIndex + 1} of {questions.length}
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-umber dark:text-zinc-100 truncate max-w-[250px] md:max-w-md">
            {safeDeck.title}
          </h2>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {timeLeftSeconds !== null && (
            <Badge variant="outline" className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono font-bold text-sm md:text-base border-taupe/30 dark:border-zinc-700 ${timeLeftSeconds < 60 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-umber dark:text-zinc-100'}`}>
              <Timer size={16} /> {formatTime(timeLeftSeconds)}
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsFinished(true)} className="text-taupe dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 -mr-2" title="Quit Exam">
            <X size={20} />
          </Button>
        </div>
      </div>

      <Card className="flex-1 rounded-3xl p-6 md:p-10 shadow-md flex flex-col mb-8 bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800">
        <div className="mb-8">
          <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 hover:bg-amber-100 border-none rounded text-[10px] font-bold uppercase tracking-widest mb-4">{currentQ.scenario}</Badge>
          <h3 className="text-lg md:text-xl font-medium text-umber dark:text-zinc-100 leading-relaxed">
            {currentQ.question}
          </h3>
        </div>
        <div className="space-y-3 mt-auto">
          {currentQ.options.map((opt, i) => {
            const isSelected = answers[currentIndex] === opt;
            const isCorrect = opt === currentQ.answer;
            const showCorrect = answeredCurrent && isCorrect;
            const showIncorrect = isSelected && !isCorrect;

            let bgClass = 'bg-white dark:bg-zinc-950 border-taupe/30 dark:border-zinc-800 hover:bg-greige/10 dark:hover:bg-zinc-800 text-umber dark:text-zinc-300';
            let circleClass = 'border-taupe/40 dark:border-zinc-600 bg-transparent';
            let textClass = 'text-umber dark:text-zinc-300 font-medium';

            if (showCorrect) {
                bgClass = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600';
                circleClass = 'border-emerald-600 dark:border-emerald-500 bg-emerald-600 dark:bg-emerald-500';
                textClass = 'text-emerald-900 dark:text-emerald-400 font-bold';
            } else if (showIncorrect) {
                bgClass = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 dark:border-rose-600';
                circleClass = 'border-rose-600 dark:border-rose-500 bg-rose-600 dark:bg-rose-500';
                textClass = 'text-rose-900 dark:text-rose-400 font-bold';
            } else if (answeredCurrent) {
                bgClass = 'bg-white/50 dark:bg-zinc-950/50 border-taupe/20 dark:border-zinc-800/50 opacity-60';
            }

            return (
              <button 
                key={i} 
                disabled={answeredCurrent}
                onClick={() => handleSelect(opt)}
                className={`w-full p-4 md:p-5 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${bgClass}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${circleClass}`}>
                  {(showCorrect || showIncorrect) && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                </div>
                <p className={`text-sm md:text-base leading-relaxed ${textClass}`}>{opt}</p>
              </button>
            )
          })}
        </div>
      </Card>

      <div className="sticky bottom-0 w-full bg-sand dark:bg-zinc-950 py-4 z-20 flex justify-between items-center border-t border-taupe/10 dark:border-zinc-800/50 mt-auto transition-colors">
        <Button variant="outline" onClick={() => setCurrentIndex(prev => prev - 1)} disabled={currentIndex === 0} className="h-12 px-6 rounded-xl font-bold bg-white dark:bg-zinc-900 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 border-taupe/30 dark:border-zinc-700 shadow-sm transition-all">
           <ChevronLeft size={18} className="mr-2" /> Previous
        </Button>
        <Button onClick={handleNext} disabled={!answeredCurrent} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 h-12 px-8 rounded-xl font-bold shadow-md disabled:opacity-50 transition-all">
           {currentIndex === questions.length - 1 ? "Finish Assessment" : "Next Question"} <ChevronRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

function MultiplayerView({ navigateTo, myDecks }) {
  const [view, setView] = useState('menu');
  const [pinInput, setPinInput] = useState('');
  const [lobbyPin, setLobbyPin] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    let interval;
    if (view === 'lobby' && isHost) {
      const fakeNames = ['Aleck', 'Gab', 'Ranz', 'Steven', 'Deen'];
      let joinCount = 0;
      interval = setInterval(() => {
        if (joinCount < fakeNames.length) {
          setPlayers(prev => [...prev, { name: fakeNames[joinCount], score: 0 }]);
          joinCount++;
        } else {
          clearInterval(interval);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [view, isHost]);

  useEffect(() => {
    let timer;
    if (view === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (view === 'playing' && timeLeft === 0) {
       setTimeout(handleNextQuestion, 1500);
    }
    return () => clearInterval(timer);
  }, [view, timeLeft]);

  const handleJoin = () => {
    if (pinInput.length < 5) return;
    setIsHost(false);
    setSelectedDeck({ cards: [{ term: "Placeholder", definition: "Awaiting Host" }]}); 
    setLobbyPin(pinInput);
    setPlayers([
      { name: 'Cath', score: 0 },
      { name: 'Alaiza', score: 0 },
      { name: 'You', score: 0, isMe: true },
    ]);
    setView('lobby');
  };

  const handleHostDeckSelect = (deck) => {
    setSelectedDeck(deck);
    setIsHost(true);
    setLobbyPin(Math.floor(100000 + Math.random() * 900000).toString());
    setPlayers([{ name: 'You', score: 0, isMe: true }]);
    setView('lobby');
  };

  const startGame = () => {
    setView('playing');
    setTimeLeft(15);
  };

  const handleAnswerSelect = (optIndex) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optIndex);
    setPlayers(prev => prev.map(p => {
       if (p.isMe) return { ...p, score: p.score + (optIndex === 0 ? 150 : 0) };
       return { ...p, score: p.score + (Math.random() > 0.4 ? 120 : 0) };
    }).sort((a, b) => b.score - a.score));
  };

  const handleNextQuestion = () => {
    if (currentQIndex < (selectedDeck?.cards?.length || 0) - 1) {
       setCurrentQIndex(prev => prev + 1);
       setSelectedAnswer(null);
       setTimeLeft(15);
    } else {
       setView('results');
    }
  };

  if (view === 'select-deck') {
    return (
      <div className="max-w-5xl mx-auto animate-in fade-in duration-300 pb-12">
        <Button variant="ghost" onClick={() => setView('menu')} className="-ml-4 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 mb-6 font-medium">
          <ArrowLeft size={16} className="mr-2" /> Back to Multiplayer
        </Button>
        <h2 className="text-2xl font-bold text-umber dark:text-zinc-100 mb-6">Select a Deck to Host</h2>
        
        {myDecks.length === 0 ? (
           <Card className="border-2 border-dashed border-taupe/30 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 p-12 text-center flex flex-col items-center justify-center animate-in fade-in rounded-3xl">
              <div className="w-16 h-16 bg-greige/30 dark:bg-zinc-800 text-umber dark:text-zinc-400 rounded-full flex items-center justify-center mb-4"><Zap size={32} /></div>
              <CardTitle className="text-xl text-umber dark:text-zinc-100 mb-2">No decks available</CardTitle>
              <CardDescription className="text-taupe dark:text-zinc-500 mb-6 max-w-md mx-auto">You need to create a deck first before you can host a live multiplayer battle.</CardDescription>
              <Button onClick={() => navigateTo('new-deck')} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 font-bold rounded-xl h-12">Create a Deck</Button>
           </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myDecks.map(deck => (
              <Card key={deck.id} onClick={() => handleHostDeckSelect(deck)} className="bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-40 relative group animate-in zoom-in duration-200 rounded-xl">
                <CardContent className="pt-5 pb-0">
                  <h3 className="font-semibold text-umber dark:text-zinc-100 text-lg group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors pr-8 truncate">{deck.title}</h3>
                  <p className="text-xs text-taupe dark:text-zinc-500 mt-1">{new Date(deck.createdAt || Date.now()).toLocaleDateString()}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between mt-auto pb-5">
                  <Badge variant="secondary" className="bg-sand dark:bg-zinc-800 text-umber dark:text-zinc-300 font-bold hover:bg-sand dark:hover:bg-zinc-800 border-none">{deck.cards?.length || 0} Cards</Badge>
                  <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50 font-bold gap-1 border-none"><Play size={12} fill="currentColor" /> Host</Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === 'lobby') {
    return (
      <div className="max-w-3xl mx-auto animate-in fade-in duration-300 pb-12 text-center mt-10">
        <h2 className="text-xl font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest mb-4">Waiting for players...</h2>
        <Card className="p-10 shadow-sm mb-10 bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 rounded-3xl">
          <p className="text-sm font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest mb-2">Join at CramZero with Pin:</p>
          <p className="text-6xl md:text-7xl font-mono font-black text-umber dark:text-zinc-100 tracking-[0.2em]">{lobbyPin}</p>
        </Card>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {players.map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-sand dark:bg-zinc-800 border-2 border-umber dark:border-zinc-500 text-umber dark:text-zinc-100 flex items-center justify-center font-bold text-xl uppercase shadow-sm">
                {p.name.substring(0,2)}
              </div>
              <p className="text-sm font-bold text-umber dark:text-zinc-300">{p.name}</p>
            </div>
          ))}
          {players.length === 1 && <div className="text-taupe dark:text-zinc-500 text-sm mt-5 w-full">Waiting for others to join...</div>}
        </div>

        {isHost ? (
          <Button size="lg" onClick={startGame} disabled={players.length < 2} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 h-14 px-10 rounded-xl font-bold text-lg shadow-md">
            Start Live Battle
          </Button>
        ) : (
          <Badge variant="outline" className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 px-6 py-4 rounded-xl font-bold text-sm">
            Waiting for host to start the game...
          </Badge>
        )}
      </div>
    );
  }

  if (view === 'playing') {
    return (
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 animate-in fade-in duration-300 h-full relative">
        <div className="flex-[3] flex flex-col">
          <div className="sticky top-0 z-20 bg-sand/90 dark:bg-zinc-950/90 backdrop-blur-md pt-2 pb-4 mb-6 border-b border-taupe/20 dark:border-zinc-800 flex justify-between items-end transition-colors">
            <div>
              <p className="text-[10px] font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest mb-1">
                Live Battle • Question {currentQIndex + 1} of {selectedDeck?.cards?.length || 0}
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-umber dark:text-zinc-100 truncate max-w-[200px] md:max-w-xs">
                {selectedDeck?.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Badge variant="outline" className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono font-bold text-sm md:text-base border-taupe/30 dark:border-zinc-700 ${timeLeft < 6 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-umber dark:text-zinc-100'}`}>
                <Timer size={16} /> {timeLeft}s
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => setView('menu')} className="text-taupe dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 -mr-2" title="Quit Exam">
                <X size={20} />
              </Button>
            </div>
          </div>

          <Card className="flex-1 rounded-3xl p-6 shadow-md flex flex-col mb-4 bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800">
            <h3 className="text-2xl font-medium text-umber dark:text-zinc-100 leading-relaxed text-center my-auto">
              What is the definition of "{selectedDeck?.cards[currentQIndex]?.term}"?
            </h3>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              selectedDeck?.cards[currentQIndex]?.definition,
              "A generic distractor option generated by the AI.",
              "Another plausible but incorrect definition.",
              "A completely wrong answer to test your active recall."
            ].map((opt, i) => (
              <button 
                key={i} 
                disabled={selectedAnswer !== null}
                onClick={() => handleAnswerSelect(i)}
                className={`p-6 rounded-2xl border-2 text-left font-medium transition-all ${
                  selectedAnswer === i 
                    ? i === 0 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 text-emerald-800 dark:text-emerald-400 shadow-md' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 dark:border-rose-600 text-rose-800 dark:text-rose-400 shadow-md'
                    : selectedAnswer !== null && i === 0 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 text-emerald-800 dark:text-emerald-400 shadow-md'
                      : 'bg-white dark:bg-zinc-950 border-taupe/30 dark:border-zinc-800 text-umber dark:text-zinc-300 hover:border-umber dark:hover:border-zinc-600 disabled:opacity-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <Card className="flex-1 rounded-3xl p-6 shadow-sm flex flex-col h-[50vh] lg:h-[80vh] overflow-hidden bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 sticky top-24">
          <h3 className="font-bold text-umber dark:text-zinc-100 mb-4 flex items-center gap-2 border-b border-taupe/20 dark:border-zinc-800 pb-4"><Target size={18}/> Live Leaderboard</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {players.map((p, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${p.isMe ? 'bg-sand dark:bg-amber-950/20 border-amber-300 dark:border-amber-800' : 'bg-greige/10 dark:bg-zinc-950 border-taupe/20 dark:border-zinc-800'}`}>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-taupe dark:text-zinc-500 w-4">{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-taupe/20 dark:border-zinc-700 text-umber dark:text-zinc-100 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {p.name.substring(0,2)}
                  </div>
                  <span className={`font-bold text-sm ${p.isMe ? 'text-amber-800 dark:text-amber-500' : 'text-umber dark:text-zinc-300'}`}>{p.name}</span>
                </div>
                <span className="font-mono font-bold text-umber dark:text-zinc-100">{p.score}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (view === 'results') {
    return (
      <Card className="max-w-2xl mx-auto animate-in zoom-in duration-300 text-center mt-10 rounded-3xl p-10 shadow-xl border-taupe/30 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Award size={48} />
        </div>
        <h2 className="text-4xl font-black text-umber dark:text-zinc-100 mb-2">Battle Complete!</h2>
        <p className="text-taupe dark:text-zinc-400 mb-10 text-lg">Here are the final standings.</p>
        
        <div className="space-y-4 mb-10">
          {players.map((p, i) => (
            <div key={i} className={`flex items-center justify-between p-5 rounded-2xl border ${i === 0 ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 scale-105 shadow-md' : p.isMe ? 'bg-sand dark:bg-zinc-800/80 border-amber-200 dark:border-amber-800/50' : 'bg-greige/10 dark:bg-zinc-950 border-taupe/20 dark:border-zinc-800'}`}>
              <div className="flex items-center gap-4">
                <span className={`font-black text-xl w-6 ${i === 0 ? 'text-amber-600 dark:text-amber-500' : 'text-taupe dark:text-zinc-600'}`}>{i + 1}</span>
                <span className={`font-bold text-lg ${p.isMe ? 'text-amber-800 dark:text-amber-400' : 'text-umber dark:text-zinc-300'}`}>{p.name} {p.isMe && '(You)'}</span>
              </div>
              <span className="font-mono font-bold text-xl text-umber dark:text-zinc-100">{p.score}</span>
            </div>
          ))}
        </div>

        <Button size="lg" onClick={() => setView('menu')} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 h-14 rounded-xl font-bold w-full shadow-md">
          Back to Multiplayer Menu
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 animate-in fade-in duration-300 items-center pb-12">
      <Card className="p-6 md:p-8 rounded-2xl shadow-sm text-center bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800">
        <div className="w-16 h-16 bg-greige/30 dark:bg-zinc-800 text-umber dark:text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-6"><Users size={32}/></div>
        <h2 className="text-xl md:text-2xl font-bold text-umber dark:text-zinc-100 mb-2">Join a Lobby</h2>
        <p className="text-taupe dark:text-zinc-400 text-xs md:text-sm mb-6">Enter your classmate's 6-digit session pin to join the live quiz.</p>
        <Input 
          type="text" 
          placeholder="e.g. 123456" 
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
          className="w-full text-center text-xl md:text-2xl tracking-[0.5em] font-mono h-16 bg-sand/30 dark:bg-zinc-950 border-taupe/40 dark:border-zinc-800 focus-visible:ring-umber dark:focus-visible:ring-zinc-600 rounded-xl mb-4 text-umber dark:text-zinc-100" 
        />
        <Button size="lg" onClick={handleJoin} className="w-full bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 h-12 rounded-xl font-medium">
          Join Session
        </Button>
      </Card>
      
      <Card className="bg-sand/40 dark:bg-zinc-900/40 p-6 md:p-8 rounded-2xl shadow-sm text-center h-full flex flex-col justify-center border-taupe/30 dark:border-zinc-800">
        <h2 className="text-xl md:text-2xl font-bold text-umber dark:text-zinc-100 mb-2">Host a Lobby</h2>
        <p className="text-taupe dark:text-zinc-400 text-xs md:text-sm mb-6">Select one of your existing decks and challenge your friends in real-time.</p>
        <Button variant="outline" size="lg" onClick={() => setView('select-deck')} className="w-full h-12 rounded-xl font-medium border-2 border-umber dark:border-zinc-500 text-umber dark:text-zinc-300 hover:bg-umber/5 dark:hover:bg-zinc-800 hover:text-umber dark:hover:text-zinc-100 bg-transparent">
          Select Deck to Host
        </Button>
      </Card>
    </div>
  );
}