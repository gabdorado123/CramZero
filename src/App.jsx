import { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Clock, FileText, Send, ChevronLeft, ChevronRight, RotateCw, Menu, X, 
  MessageCircle, UploadCloud, Sparkles, Home, Library, Users, BarChart2, Play, Plus, 
  ArrowLeft, Mic, MicOff, Volume2, Settings, Edit3, Trash2, HelpCircle, CheckCircle, 
  Search, Layers, Brain, Zap, MessageSquare, TrendingUp, Calendar, Target,
  Shuffle, Maximize, RotateCcw, Star, Check, ArrowRight, ShieldCheck, Award
} from 'lucide-react';

// --- MOCK DATA ---
const mockDecks = [
  {
    id: 'deck-1',
    title: 'React Hooks Fundamentals',
    createdAt: '2 days ago',
    visibility: 'Private',
    cards: [
      { id: 1, term: 'useEffect', definition: 'A React Hook that lets you synchronize a component with an external system.' },
      { id: 2, term: 'useState', definition: 'A Hook that lets you add a state variable to your component.' },
      { id: 3, term: 'Dependency Array', definition: 'Controls when useEffect runs. Empty [] means run once on mount. Omitting it means run on every render.' },
    ]
  },
  {
    id: 'deck-2',
    title: 'French Verbs - Phase 1',
    createdAt: '5 days ago',
    visibility: 'Public',
    cards: [
      { id: 4, term: 'Être', definition: 'To be (Je suis, Tu es, Il/Elle est...)' },
      { id: 5, term: 'Avoir', definition: 'To have (J\'ai, Tu as, Il/Elle a...)' },
      { id: 6, term: 'Aller', definition: 'To go (Je vais, Tu vas, Il/Elle va...)' },
    ]
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeDeck, setActiveDeck] = useState(null);
  const [hasActiveDeck, setHasActiveDeck] = useState(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'study', label: 'Study Session', icon: BookOpen },
    { id: 'decks', label: 'My Decks', icon: Library },
    { id: 'multiplayer', label: 'Multiplayer', icon: Users },
  ];

  if (currentView === 'landing') {
    return <LandingPageView navigateTo={setCurrentView} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-sand relative animate-in fade-in duration-300">
      
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Navigation - Stays open until explicitly toggled or closed */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 ${
        isSidebarOpen ? 'w-64 p-4 translate-x-0' : 'w-0 p-0 -translate-x-full lg:translate-x-0 lg:w-0 lg:p-0 lg:opacity-0'
      } transition-all duration-300 ease-in-out border-r border-taupe/30 bg-white shadow-2xl lg:shadow-none flex flex-col whitespace-nowrap overflow-hidden`}>
        <div className="flex items-center justify-between mb-8 min-w-[224px]">
          <h1 className="text-2xl font-bold text-umber flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('landing')}>
            <BookOpen className="text-umber" /> CramZero
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="text-taupe hover:text-umber">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 space-y-2 min-w-[224px]">
          <p className="text-xs font-bold text-taupe uppercase tracking-wider mb-4 px-3">Main Menu</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)} // Sidebar no longer auto-closes on selection
              className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg font-medium transition-colors ${
                currentView === item.id 
                  ? 'bg-umber text-sand shadow-sm' 
                  : 'text-umber/80 hover:bg-taupe/20'
              }`}
            >
              <item.icon size={18} className={currentView === item.id ? 'text-sand' : 'text-taupe'} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-taupe/20 min-w-[224px]">
          <button onClick={() => setCurrentView('landing')} className="w-full text-left px-3 py-2 text-xs font-bold text-taupe hover:text-umber transition-colors">
            ← Back to Landing Page
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col bg-white shadow-inner relative overflow-y-auto"> 
        <header className="p-4 border-b border-taupe/20 flex items-center gap-4 bg-white sticky top-0 z-20">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 rounded-lg text-taupe hover:bg-greige/30 hover:text-umber transition-colors"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-lg md:text-xl font-semibold text-umber capitalize truncate">
            {currentView === 'new-deck' ? 'Create New Deck' : currentView.replace('-', ' ')}
          </h2>
        </header>

        <div className="flex-1 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {currentView === 'dashboard' && <DashboardView navigateTo={setCurrentView} setHasActiveDeck={setHasActiveDeck} />}
          {currentView === 'study' && <StudyView hasActiveDeck={hasActiveDeck} setHasActiveDeck={setHasActiveDeck} />}
          {currentView === 'decks' && <DecksView navigateTo={setCurrentView} setActiveDeck={setActiveDeck} />}
          {currentView === 'new-deck' && <NewDeckView navigateTo={setCurrentView} />}
          {currentView === 'multiplayer' && <MultiplayerView />}
          
          {currentView === 'deck-details' && <DeckDetailsView navigateTo={setCurrentView} activeDeck={activeDeck} setIsTutorOpen={setIsTutorOpen} />}
          {currentView === 'flashcard-mode' && <FlashcardModeView navigateTo={setCurrentView} activeDeck={activeDeck} setIsTutorOpen={setIsTutorOpen} />}
          {currentView === 'quiz-setup' && <QuizSetupView navigateTo={setCurrentView} />}
        </div>
      </main>

      {/* Floating AI Tutor Toggle */}
      {(currentView === 'flashcard-mode' || currentView === 'deck-details' || currentView === 'study') && (activeDeck || hasActiveDeck) && !isTutorOpen && (
        <button 
          onClick={() => setIsTutorOpen(true)}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 p-3.5 md:p-4 bg-umber text-sand rounded-full shadow-xl hover:scale-105 transition-all z-50 flex items-center justify-center animate-in zoom-in duration-300 group"
        >
          <MessageCircle size={26} />
          <span className="absolute top-2 right-2 md:top-3 md:right-3 w-3 h-3 bg-emerald-500 border-2 border-umber rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Floating AI Tutor Chat Window */}
      {(currentView === 'flashcard-mode' || currentView === 'deck-details' || currentView === 'study') && (activeDeck || hasActiveDeck) && isTutorOpen && (
        <aside className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-8 md:right-8 md:w-96 h-[500px] md:h-[550px] bg-white border border-taupe/30 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
          <div className="p-4 border-b border-taupe/30 bg-greige/40 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-umber flex items-center gap-2 text-base md:text-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Professor AI
              </h3>
              <p className="text-xs text-taupe mt-1 ml-4 font-medium">Vocal Language Partner & Tutor</p>
            </div>
            <button onClick={() => setIsTutorOpen(false)} className="text-taupe hover:text-umber transition-colors p-1.5 rounded hover:bg-taupe/20">
              <X size={18} />
            </button>
          </div>
          
          <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-4 bg-greige/10">
            <div className="flex flex-col gap-1 w-11/12 relative group">
              <div className="bg-white border border-taupe/20 p-3.5 rounded-2xl rounded-tl-none text-xs md:text-sm text-umber shadow-sm leading-relaxed pr-10 border-l-4 border-l-amber-500">
                I see you are studying {activeDeck?.title || 'a new deck'}. Want me to explain any confusing terms or practice pronunciation?
              </div>
              <button className="absolute right-2 top-3 p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-all shadow-sm bg-white border border-taupe/20 animate-pulse">
                <Volume2 size={16} />
              </button>
            </div>
          </div>
          
          <div className="p-3 md:p-4 bg-white border-t border-taupe/20">
            {isListening && (
              <div className="flex items-center gap-2 mb-2 px-2 text-amber-600 animate-pulse text-xs font-bold uppercase tracking-wider">
                <Mic size={14} /> Listening to your pronunciation...
              </div>
            )}
            
            <div className="flex gap-2 items-end">
              <button 
                onClick={() => setIsListening(!isListening)}
                className={`p-2.5 md:p-3 rounded-xl transition-all flex items-center justify-center shadow-sm border ${
                  isListening 
                    ? 'bg-amber-100 text-amber-600 border-amber-300' 
                    : 'bg-greige/20 text-taupe hover:text-umber border-taupe/30 hover:bg-greige/40'
                }`}
              >
                {isListening ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              
              <textarea 
                placeholder={isListening ? "Speak now..." : "Ask your professor..."}
                className="flex-1 bg-greige/10 border border-taupe/30 rounded-xl px-3 py-2.5 text-xs md:text-sm text-umber placeholder:text-taupe focus:outline-none focus:border-umber transition-all resize-none h-[42px] min-h-[42px]"
              ></textarea>
              
              <button className="bg-umber text-sand p-2.5 md:p-3 rounded-xl hover:bg-umber/90 transition-all flex items-center justify-center shadow-sm">
                <Send size={18} />
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

/* =========================================
   OFFICIAL UNIQUE LANDING PAGE COMPONENT (NON-STICKY HEADER)
   ========================================= */

function LandingPageView({ navigateTo }) {
  const [activeStudyTab, setActiveStudyTab] = useState(1);
  const [typedText, setTypedText] = useState('');
  const [isBuilding, setIsBuilding] = useState(true);
  const [revealedCount, setRevealedCount] = useState(0);

  const fullPrompt = "Cardiac medications — ACE inhibitors, beta blockers, CCBs...";
  const generatedItems = [
    "Generated 12 cards",
    "ACE inhibitors",
    "Beta blockers",
    "Calcium channel blockers"
  ];

  useEffect(() => {
    let timeout;
    if (isBuilding) {
      if (typedText.length < fullPrompt.length) {
        timeout = setTimeout(() => {
          setTypedText(fullPrompt.slice(0, typedText.length + 1));
        }, 40);
      } else {
        timeout = setTimeout(() => {
          setIsBuilding(false);
          setRevealedCount(1);
        }, 600);
      }
    } else {
      if (revealedCount < generatedItems.length) {
        timeout = setTimeout(() => {
          setRevealedCount(prev => prev + 1);
        }, 400);
      } else {
        timeout = setTimeout(() => {
          setTypedText('');
          setIsBuilding(true);
          setRevealedCount(0);
        }, 3000);
      }
    }
    return () => clearTimeout(timeout);
  }, [typedText, isBuilding, revealedCount]);

  return (
    <div className="min-h-screen bg-sand text-umber font-sans flex flex-col selection:bg-umber selection:text-sand animate-in fade-in duration-300">
      
      {/* Navigation */}
      <header className="px-4 md:px-8 py-5 flex justify-between items-center w-full border-b border-taupe/20 bg-white">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2 text-xl md:text-2xl font-black tracking-tight cursor-pointer" onClick={() => navigateTo('landing')}>
            <BookOpen className="text-umber" /> CramZero
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-umber/80 text-sm">
            <a href="#study-ways" className="hover:text-umber transition-colors">Interactive Modes</a>
            <a href="#architecture" className="hover:text-umber transition-colors">Ecosystem</a>
            <a href="#faq" className="hover:text-umber transition-colors">Architecture & FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => navigateTo('dashboard')} className="font-semibold text-umber/90 hover:text-umber text-sm hidden sm:inline-block">
              Sign in
            </button>
            <button 
              onClick={() => navigateTo('dashboard')}
              className="bg-umber text-sand px-4 md:px-5 py-2 rounded-full font-bold text-xs md:text-sm hover:bg-umber/90 transition-all shadow-sm hover:scale-105"
            >
              Launch App →
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Live Animated Simulator */}
      <section className="px-4 md:px-8 py-16 md:py-20 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-greige/30 border border-taupe/30 text-xs font-bold uppercase tracking-wider text-umber shadow-sm animate-in fade-in">
            <Sparkles size={14} className="text-amber-600" /> Account-Free & Frictionless
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-umber animate-in fade-in">
            Upload files. Generate decks. <span className="text-taupe underline decoration-umber/30">Zero friction.</span>
          </h1>
          <p className="text-base md:text-lg text-taupe leading-relaxed font-medium animate-in fade-in">
            Transform heavy PDFs, PPTX slides, and lecture notes into smart flashcards and quizzes instantly using Google Gemini AI.
          </p>
          <div className="flex items-center justify-center lg:justify-start gap-4 pt-2 animate-in fade-in">
            <button 
              onClick={() => navigateTo('dashboard')}
              className="bg-umber text-sand px-6 md:px-8 py-3.5 md:py-4 rounded-xl font-bold text-sm md:text-base hover:bg-umber/90 shadow-md hover:scale-[1.02] flex items-center gap-2"
            >
              Start Studying Now <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Live Simulator Card (Fixed with pt-16 and top-5 badge position) */}
        <div className="lg:col-span-6 bg-white border border-taupe/30 rounded-3xl p-5 md:p-6 pt-16 shadow-2xl relative">
          <div className="absolute top-5 right-6 bg-amber-500 text-umber text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest shadow-sm z-10">
            Live AI Synthesis
          </div>
          
          <div className="mb-6">
            <span className="text-xs font-bold text-taupe uppercase tracking-wider block mb-2">GENERATE : PHARMACOLOGY</span>
            <div className="bg-sand/30 border border-taupe/20 rounded-xl p-4 font-mono text-sm text-umber min-h-[54px] flex items-center">
              <span>{typedText}</span>
              <span className="w-2 h-4 bg-umber ml-1 animate-pulse"></span>
            </div>
          </div>

          <div className="space-y-3 bg-greige/10 p-4 rounded-2xl border border-taupe/20 min-h-[160px] flex flex-col justify-center">
            {isBuilding ? (
              <div className="flex items-center justify-center gap-2 text-taupe text-sm font-medium py-4">
                <RotateCw size={16} className="animate-spin text-amber-600" /> Building your deck...
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in duration-300">
                {generatedItems.slice(0, revealedCount).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-umber font-medium animate-in slide-in-from-bottom-1 duration-200">
                    <Check size={16} className="text-emerald-600 shrink-0" /> {item}
                  </div>
                ))}
                {revealedCount >= generatedItems.length && (
                  <p className="text-[11px] text-taupe/70 pt-1 font-semibold">+ 8 more terms compiled...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* INTERACTIVE "STUDY YOUR WAY" SECTION */}
      <section id="study-ways" className="px-4 md:px-8 py-16 md:py-20 max-w-6xl mx-auto w-full">
        <div className="mb-10 text-center md:text-left">
          <span className="text-xs font-bold text-taupe uppercase tracking-widest">See it in action</span>
          <h2 className="text-3xl md:text-4xl font-black text-umber mt-2">Study your way.</h2>
          <p className="text-taupe text-sm md:text-base mt-1">Four specialized modes, all from your ingested documents.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-3">
            {[
              { id: 1, title: 'Flashcard Review', desc: 'Tap to flip cards. Self-rate confidence to train spaced repetition.' },
              { id: 2, title: 'Auto-generated Quizzes', desc: 'Multiple choice & identification questions generated straight from files.' },
              { id: 3, title: 'Professor AI Tutor', desc: 'Chat with an AI that has complete context of your uploaded study material.' },
              { id: 4, title: 'File Ingestion & Generation', desc: 'Drop PDFs, PPTX lecture slides, JSON or TXT to build decks instantly.' },
            ].map((tab) => (
              <div 
                key={tab.id}
                onClick={() => setActiveStudyTab(tab.id)}
                className={`p-4 md:p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  activeStudyTab === tab.id 
                    ? 'bg-white border-umber shadow-md lg:translate-x-2 animate-in fade-in' 
                    : 'bg-sand/40 border-taupe/20 hover:bg-white/60 text-taupe hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${activeStudyTab === tab.id ? 'bg-umber text-sand' : 'bg-taupe/30 text-umber'}`}>
                    {tab.id}
                  </span>
                  <h3 className={`font-bold text-base md:text-lg ${activeStudyTab === tab.id ? 'text-umber' : 'text-taupe'}`}>{tab.title}</h3>
                </div>
                <p className="text-xs text-taupe ml-9 leading-relaxed">{tab.desc}</p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7 bg-white border border-taupe/30 rounded-3xl p-6 md:p-8 shadow-xl min-h-[380px] flex flex-col justify-center relative overflow-hidden animate-in fade-in duration-300 hover:shadow-2xl transition-shadow duration-300">
            {activeStudyTab === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-xs font-bold text-taupe uppercase tracking-wider">Flashcard • Data Structures</div>
                <div className="bg-sand/30 border border-taupe/20 p-6 md:p-8 rounded-2xl text-center space-y-3">
                  <p className="text-base md:text-lg font-bold text-umber">What is the worst-case time complexity of quicksort when pivot selection fails consistently?</p>
                  <p className="text-xs text-taupe italic">Tap to reveal answer</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button className="bg-rose-50 border border-rose-200 text-rose-700 py-2 rounded-xl text-xs font-bold">Hard (1m)</button>
                  <button className="bg-amber-50 border border-amber-200 text-amber-700 py-2 rounded-xl text-xs font-bold">Good (10m)</button>
                  <button className="bg-emerald-50 border border-emerald-200 text-emerald-700 py-2 rounded-xl text-xs font-bold">Easy (4d)</button>
                </div>
              </div>
            )}

            {activeStudyTab === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-taupe uppercase tracking-wider">
                  <span>Quiz Mode</span>
                  <span>Question 2 of 5</span>
                </div>
                <h3 className="font-bold text-base md:text-lg text-umber">Which data structure operates on a Last-In, First-Out (LIFO) basis?</h3>
                <div className="space-y-2">
                  {['Queue', 'Stack', 'Array', 'Graph'].map((opt, i) => (
                    <div key={i} className={`p-3 rounded-xl border text-sm font-medium ${i === 1 ? 'bg-amber-100 border-amber-500 text-umber' : 'bg-sand/20 border-taupe/20 text-taupe'}`}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeStudyTab === 3 && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-taupe uppercase tracking-wider">Professor AI Tutor</div>
                <div className="space-y-3 bg-greige/10 p-4 rounded-2xl border border-taupe/20">
                  <div className="bg-white p-3 rounded-xl text-xs text-umber shadow-sm max-w-[85%]">
                    Can you explain pointer arithmetic simply?
                  </div>
                  <div className="bg-umber text-sand p-3 rounded-xl text-xs shadow-sm max-w-[85%] ml-auto">
                    Pointers store memory addresses. Adding 1 to a pointer advances it by the byte size of its data type!
                  </div>
                </div>
              </div>
            )}

            {activeStudyTab === 4 && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-taupe uppercase tracking-wider">Universal File Ingestion</div>
                <div className="bg-sand/30 border border-taupe/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                  <UploadCloud size={32} className="text-umber mb-2" />
                  <p className="font-bold text-umber text-sm">Drop your .PDF, .PPTX, .JSON, or .TXT</p>
                  <p className="text-xs text-taupe mt-1">Instant structural parsing & flashcard compilation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bento Grid Architecture Section */}
      <section id="architecture" className="px-4 md:px-8 py-16 md:py-20 max-w-6xl mx-auto w-full">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-umber">Engineered for absolute retention.</h2>
          <p className="text-taupe mt-2 text-sm md:text-base">Core features built to eliminate student friction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-taupe/20 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
            <div className="absolute top-0 right-0 p-8 text-taupe/10 group-hover:text-taupe/20 transition-colors pointer-events-none">
              <Brain size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-greige/30 text-umber rounded-2xl flex items-center justify-center mb-6">
                <Brain size={24} />
              </div>
              <h3 className="font-bold text-xl md:text-2xl text-umber mb-2">Neural Spaced Repetition</h3>
              <p className="text-taupe text-sm md:text-base max-w-md leading-relaxed">
                Our custom algorithm schedules reviews dynamically based on your confidence ratings, ensuring information moves to long-term memory.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 md:gap-3 relative z-10">
              <span className="bg-sand px-3 py-1 rounded-lg text-xs font-bold text-umber">Confidence Sliders</span>
              <span className="bg-sand px-3 py-1 rounded-lg text-xs font-bold text-umber">Automated Intervals</span>
            </div>
          </div>

          <div id="vocal-tutor" className="bg-white border border-taupe/20 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
            <div>
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-6">
                <Mic size={24} />
              </div>
              <h3 className="font-bold text-lg md:text-xl text-umber mb-2">Vocal Language Partner</h3>
              <p className="text-taupe text-sm leading-relaxed">
                Integrated Web Speech API lets Professor AI speak definitions aloud and listen to your oral responses.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-taupe/10 flex items-center gap-2 text-xs font-bold text-amber-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Speech Engine
            </div>
          </div>

          <div className="bg-white border border-taupe/20 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
            <div>
              <div className="w-12 h-12 bg-greige/30 text-umber rounded-2xl flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-lg md:text-xl text-umber mb-2">Multiplayer Lobbies</h3>
              <p className="text-taupe text-sm leading-relaxed">
                Host or join live quiz rooms with classmates using a 6-digit session pin for high-stakes study sessions.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-taupe/10 flex items-center gap-2 text-xs font-bold text-umber">
              Real-time sync enabled
            </div>
          </div>

          <div className="md:col-span-2 bg-umber text-sand p-6 md:p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-200">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-sand/10 text-sand rounded-2xl flex items-center justify-center mb-6 border border-sand/20">
                <UploadCloud size={24} />
              </div>
              <h3 className="font-bold text-xl md:text-2xl mb-2">Upload File Generation (.PDF, .PPTX, .JSON, .TXT)</h3>
              <p className="text-sand/80 text-sm md:text-base max-w-lg leading-relaxed">
                Instantly upload course materials. CramZero's parser extracts definitions, key terms, and generates complete interactive decks and quizzes automatically.
              </p>
            </div>
            <div className="mt-8 flex gap-2 md:gap-3 relative z-10 flex-wrap">
              <span className="bg-sand/10 border border-sand/20 px-3 py-1 rounded-lg text-xs font-bold">PDF Support</span>
              <span className="bg-sand/10 border border-sand/20 px-3 py-1 rounded-lg text-xs font-bold">PowerPoint PPTX</span>
              <span className="bg-sand/10 border border-sand/20 px-3 py-1 rounded-lg text-xs font-bold">JSON & TXT</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="px-4 md:px-8 py-16 md:py-20 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-taupe uppercase tracking-widest">Transparency & Tech</span>
          <h2 className="text-3xl md:text-4xl font-black text-umber mt-2">Frequently Asked Questions</h2>
          <p className="text-taupe text-sm md:text-base mt-2">Everything you need to know about CramZero's architecture.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { q: "Do I need to create an account to start?", a: "No! CramZero is completely account-free by design. You can drop files, generate decks, and study right in your browser instantly." },
            { q: "What file formats are supported for upload generation?", a: "You can upload PDF documents, PowerPoint (.pptx) presentation slides, plain text (.txt), and JSON exports." },
            { q: "How does Professor AI use my documents?", a: "When you upload or paste notes, our backend securely queries the Google Gemini API to build contextual flashcards and answer your specific questions." },
            { q: "Is CramZero free for students?", a: "Yes, 100% free for all students with full access to flashcard reviews, quizzes, and multiplayer battle rooms." }
          ].map((faq, i) => (
            <div key={i} className="bg-white border border-taupe/20 p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-umber text-sm md:text-base mb-2 flex items-center gap-2">
                <HelpCircle size={18} className="text-taupe shrink-0" /> {faq.q}
              </h3>
              <p className="text-taupe text-xs md:text-sm leading-relaxed ml-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-umber text-sand py-12 md:py-16 px-8 text-center mt-auto border-t border-taupe/20">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          <div className="flex items-center justify-center gap-2 text-2xl font-black">
            <BookOpen /> CramZero
          </div>
          <p className="text-sand/70 text-xs md:text-sm max-w-md mx-auto">
            The high-performance study platform built for students who value speed, accuracy, and zero friction.
          </p>
          <div className="pt-6 md:pt-8 border-t border-sand/10 text-xs text-sand/50">
            © 2026 CramZero. Built for modern learners.
          </div>
        </div>
      </footer>

    </div>
  );
}

/* =========================================
   APP COMPONENT VIEWS (Dashboard, Study, Decks, New Deck, Multiplayer, etc.)
   ========================================= */

function DashboardView({ navigateTo, setHasActiveDeck }) {
  const handleStartStudying = () => {
    setHasActiveDeck(true);
    navigateTo('study');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="bg-sand/40 border border-taupe/30 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-umber mb-2">Welcome back!</h2>
          <p className="text-taupe text-sm md:text-lg">You have 3 decks to review today. Ready to crush it?</p>
        </div>
        <button onClick={handleStartStudying} className="bg-umber text-sand px-6 py-3 rounded-xl font-medium hover:bg-umber/90 shadow-md flex items-center gap-2 whitespace-nowrap transition-all hover:scale-105">
          <Play size={18} fill="currentColor" /> Resume Last Session
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { title: 'Global Mastery', icon: Brain, val: '78%', sub: 'Avg. confidence rating', color: 'text-emerald-600' },
          { title: 'Study Momentum', icon: Zap, val: '12', sub: 'Active days this month', color: 'text-amber-600' },
          { title: 'Cards Conquered', icon: Target, val: '840', sub: 'Total successful flips', color: 'text-umber' },
          { title: 'AI Interactions', icon: MessageSquare, val: '42', sub: 'Questions answered by Tutor', color: 'text-blue-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-taupe/20 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform cursor-default">
            <div className="flex items-center gap-2 text-taupe text-xs font-bold uppercase tracking-wider mb-4">
              <stat.icon size={16} className={stat.color} /> {stat.title}
            </div>
            <div>
              <p className="text-3xl font-bold text-umber mb-1">{stat.val}</p>
              <p className="text-xs font-semibold text-taupe leading-relaxed">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-taupe/20 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-taupe text-xs font-bold uppercase tracking-wider">
              <Layers size={16} /> Knowledge Retention
            </div>
          </div>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-4">
              <div className="w-24 text-right text-xs md:text-sm font-bold text-umber">Needs Review</div>
              <div className="flex-1 h-3 bg-greige/20 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400 w-[15%] rounded-full"></div>
              </div>
              <div className="w-8 text-xs md:text-sm font-bold text-taupe">15%</div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-24 text-right text-xs md:text-sm font-bold text-umber">Familiar</div>
              <div className="flex-1 h-3 bg-greige/20 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 w-[35%] rounded-full"></div>
              </div>
              <div className="w-8 text-xs md:text-sm font-bold text-taupe">35%</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-24 text-right text-xs md:text-sm font-bold text-umber">Solid</div>
              <div className="flex-1 h-3 bg-greige/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[30%] rounded-full"></div>
              </div>
              <div className="w-8 text-xs md:text-sm font-bold text-taupe">30%</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-24 text-right text-xs md:text-sm font-bold text-umber">Mastered</div>
              <div className="flex-1 h-3 bg-greige/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-700 w-[20%] rounded-full"></div>
              </div>
              <div className="w-8 text-xs md:text-sm font-bold text-taupe">20%</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-taupe/20 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-taupe text-xs font-bold uppercase tracking-wider mb-8">
            <TrendingUp size={16} /> Weekly Pulse
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-3 mt-auto h-32">
            {[
              { day: 'Mon', height: 'h-1/4', active: false },
              { day: 'Tue', height: 'h-3/4', active: true },
              { day: 'Wed', height: 'h-1/2', active: false },
              { day: 'Thu', height: 'h-full', active: false },
              { day: 'Fri', height: 'h-0', active: false },
              { day: 'Sat', height: 'h-1/3', active: false },
              { day: 'Sun', height: 'h-0', active: false },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-3 flex-1 h-full justify-end">
                <div className={`w-full rounded-md transition-all duration-500 ${bar.height} ${bar.active ? 'bg-umber shadow-md' : 'bg-greige/40'}`}></div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${bar.active ? 'text-umber' : 'text-taupe'}`}>
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-taupe/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-taupe/20 flex justify-between items-center bg-greige/10">
          <div className="flex items-center gap-2 text-taupe text-xs font-bold uppercase tracking-wider">
            <BookOpen size={16} /> Active Modules
          </div>
        </div>
        
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-sand/10 transition-colors">
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <h3 className="font-bold text-umber text-base md:text-lg">React Component Lifecycle</h3>
              <span className="text-sm font-bold text-umber">65%</span>
            </div>
            <div className="w-full h-2 bg-greige/30 rounded-full overflow-hidden">
              <div className="h-full bg-umber w-[65%] rounded-full"></div>
            </div>
            <p className="text-xs text-taupe mt-2">Generated via PDF • 32 Cards Total</p>
          </div>
          
          <div className="flex flex-wrap gap-3 md:ml-8">
            <button className="px-4 py-2 bg-white border border-taupe/30 text-umber rounded-lg text-xs md:text-sm font-bold hover:bg-greige/10 transition-colors">
              Review Weak Cards
            </button>
            <button onClick={handleStartStudying} className="px-4 py-2 bg-umber text-sand rounded-lg text-xs md:text-sm font-bold hover:bg-umber/90 transition-colors">
              Study All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudyView({ navigateTo, setHasActiveDeck }) {
  const [activeTab, setActiveTab] = useState('Flashcards');
  const [reviewTab, setReviewTab] = useState('Cards');

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {['Flashcards', 'Quiz', 'Review'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`px-5 py-2 rounded-full font-bold text-xs md:text-sm transition-colors shadow-sm shrink-0 ${
              activeTab === tab ? 'bg-umber text-sand' : 'bg-white text-umber border border-taupe/20 hover:bg-greige/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Flashcards' && (
        <div className="animate-in fade-in duration-300">
          <p className="text-xs font-bold text-taupe uppercase tracking-wider mb-4">
            Filter by topic <span className="normal-case font-normal">- optional</span>
          </p>
          
          <div className="flex flex-wrap gap-2 md:gap-3 mb-8">
            <button className="px-4 md:px-5 py-2 rounded-full bg-amber-600 text-white text-xs md:text-sm font-bold shadow-sm">All</button>
            {['+ Getting Started', '+ Features', '+ Quiz Types'].map(topic => (
              <button key={topic} className="px-4 md:px-5 py-2 rounded-full bg-white border border-taupe/20 text-umber text-xs md:text-sm font-bold hover:bg-greige/10 transition-colors">
                {topic}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setHasActiveDeck && setHasActiveDeck(true)}
              className="bg-umber text-sand px-6 py-3 rounded-xl font-bold text-xs md:text-sm hover:bg-umber/90 transition-all shadow-sm flex items-center gap-2"
            >
              <Play size={18} fill="currentColor" /> Start with all decks
            </button>
          </div>
        </div>
      )}

      {activeTab === 'Quiz' && (
        <div className="animate-in fade-in duration-300">
           <p className="text-taupe text-sm">Quiz configurations will appear here.</p>
        </div>
      )}

      {activeTab === 'Review' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex gap-2 mb-8">
            <button onClick={() => setReviewTab('Cards')} className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-bold transition-colors ${reviewTab === 'Cards' ? 'bg-white border border-taupe/20 text-umber shadow-sm' : 'text-taupe hover:text-umber'}`}>Cards</button>
            <button onClick={() => setReviewTab('File')} className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-bold transition-colors flex items-center gap-2 ${reviewTab === 'File' ? 'bg-white border border-taupe/20 text-umber shadow-sm' : 'text-taupe hover:text-umber'}`}>
              File <span className="text-[10px] font-bold bg-greige/40 text-umber px-1.5 py-0.5 rounded uppercase">Beta</span>
            </button>
          </div>
          
          <p className="text-xs font-bold text-taupe uppercase tracking-wider mb-12">
            Your decks <span className="normal-case font-normal">- toggle to enroll in spaced repetition</span>
          </p>

          <div className="flex flex-col items-center justify-center text-center mt-8">
            <div className="w-16 h-16 bg-white border-2 border-taupe/20 rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm">🥚</div>
            <h3 className="text-lg font-bold text-umber mb-1">No custom decks yet!</h3>
            <p className="text-taupe text-xs md:text-sm mb-6 max-w-xs">Create a deck from your Decks page to enroll it in review.</p>
            <button onClick={() => navigateTo && navigateTo('decks')} className="text-umber font-bold text-xs md:text-sm flex items-center gap-2 hover:underline">
              <ArrowLeft size={16} /> Go to Decks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DecksView({ navigateTo, setActiveDeck }) {
  const [pinnedIds, setPinnedIds] = useState([]);

  const handleDeckClick = (deck) => {
    setActiveDeck(deck);
    navigateTo('deck-details');
  };

  const togglePin = (e, deckId) => {
    e.stopPropagation();
    setPinnedIds(prev => 
      prev.includes(deckId) ? prev.filter(id => id !== deckId) : [...prev, deckId]
    );
  };

  const pinnedDecks = mockDecks.filter(deck => pinnedIds.includes(deck.id));
  const unpinnedDecks = mockDecks.filter(deck => !pinnedIds.includes(deck.id));

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-umber">Your Saved Decks</h2>
        <button onClick={() => navigateTo('new-deck')} className="bg-umber text-sand px-4 py-2 rounded-lg font-medium hover:bg-umber/90 flex items-center gap-2 transition-colors shadow-sm text-sm">
          <Plus size={18} /> New Deck
        </button>
      </div>
      
      {pinnedDecks.length > 0 && (
        <div className="mb-10">
          <p className="text-xs font-bold text-taupe uppercase tracking-wider mb-4">Pinned ({pinnedDecks.length})</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedDecks.map((deck) => (
              <div key={deck.id} onClick={() => handleDeckClick(deck)} className="bg-white border border-taupe/30 p-5 rounded-xl hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-40 group relative">
                <button onClick={(e) => togglePin(e, deck.id)} className="absolute top-5 right-5 text-amber-500 hover:scale-110 transition-transform">
                  <Star size={20} fill="currentColor" />
                </button>
                <div>
                  <h3 className="font-semibold text-umber text-lg group-hover:text-amber-700 transition-colors pr-8">{deck.title}</h3>
                  <p className="text-sm text-taupe mt-1">Generated {deck.createdAt}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-bold bg-sand px-2 py-1 rounded text-umber">{deck.cards.length} Cards</span>
                  <div className="text-taupe group-hover:text-umber transition-colors p-2 rounded-full"><Play size={20}/></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-bold text-taupe uppercase tracking-wider mb-4">All Decks ({mockDecks.length})</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div onClick={() => navigateTo('new-deck')} className="border-2 border-dashed border-taupe/50 bg-greige/10 hover:bg-greige/30 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all h-40 text-umber group">
            <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform"><Plus size={24} /></div>
            <span className="font-semibold text-sm">Create New Deck</span>
          </div>

          {unpinnedDecks.map((deck) => (
            <div key={deck.id} onClick={() => handleDeckClick(deck)} className="bg-white border border-taupe/30 p-5 rounded-xl hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-40 group relative">
              <button onClick={(e) => togglePin(e, deck.id)} className="absolute top-5 right-5 text-taupe hover:text-amber-500 hover:scale-110 transition-all">
                <Star size={20} />
              </button>
              <div>
                <h3 className="font-semibold text-umber text-lg group-hover:text-amber-700 transition-colors pr-8">{deck.title}</h3>
                <p className="text-sm text-taupe mt-1">Generated {deck.createdAt}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs font-bold bg-sand px-2 py-1 rounded text-umber">{deck.cards.length} Cards</span>
                <div className="text-taupe group-hover:text-umber transition-colors p-2 rounded-full"><Play size={20}/></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NewDeckView({ navigateTo }) {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300 space-y-8 pb-12">
      <button onClick={() => navigateTo('decks')} className="flex items-center gap-2 text-taupe hover:text-umber transition-colors font-medium mb-6 text-sm">
        <ArrowLeft size={18} /> Back to Library
      </button>

      <div className="border-2 border-dashed border-taupe/50 bg-greige/10 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-greige/20 transition-all text-center">
        <UploadCloud size={32} className="text-umber mb-3" />
        <h3 className="font-bold text-base md:text-lg text-umber mb-1">Import from file</h3>
        <p className="text-taupe text-xs md:text-sm">Drag & drop or click — .pdf, .pptx, or .txt</p>
      </div>

      <div className="flex items-center gap-4 w-full">
        <div className="h-px bg-taupe/30 flex-1"></div>
        <span className="text-xs font-bold text-taupe uppercase tracking-widest">OR</span>
        <div className="h-px bg-taupe/30 flex-1"></div>
      </div>

      <div className="border border-amber-600/30 bg-amber-50/50 rounded-2xl p-6 flex flex-col items-center cursor-pointer hover:bg-amber-50 transition-all shadow-sm text-center">
        <Sparkles size={24} className="text-amber-600 mb-2" />
        <h3 className="font-bold text-base md:text-lg text-umber mb-1">Generate with AI</h3>
        <p className="text-taupe text-xs md:text-sm">Describe a topic, paste notes, or drop a file — let AI build your deck instantly.</p>
      </div>

      <div className="flex items-center gap-4 w-full">
        <div className="h-px bg-taupe/30 flex-1"></div>
        <span className="text-xs font-bold text-taupe uppercase tracking-widest">OR CREATE FROM SCRATCH</span>
        <div className="h-px bg-taupe/30 flex-1"></div>
      </div>

      <div className="bg-white border border-taupe/30 rounded-2xl p-6 md:p-8 shadow-sm">
        <h3 className="font-bold text-lg md:text-xl text-umber border-b border-taupe/20 pb-4 mb-6">New Deck Details</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">Deck Name *</label>
            <input type="text" placeholder="e.g. React Hooks Fundamentals" className="w-full bg-sand/20 border border-taupe/40 rounded-lg px-4 py-3 text-sm text-umber focus:outline-none focus:border-umber transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">Description</label>
            <textarea placeholder="What is this deck about?" className="w-full bg-sand/20 border border-taupe/40 rounded-lg px-4 py-3 text-sm text-umber focus:outline-none focus:border-umber h-24 resize-none transition-colors"></textarea>
          </div>
        </div>

        <h4 className="font-bold text-base md:text-lg text-umber mt-8 border-b border-taupe/20 pb-4 mb-6">Add Cards Manually</h4>
        
        <div className="bg-greige/10 border border-taupe/30 rounded-xl p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">Front (Question) *</label>
              <textarea placeholder="What is a Hook?" className="w-full bg-white border border-taupe/30 rounded-lg px-4 py-3 text-sm text-umber focus:outline-none focus:border-umber h-32 resize-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-taupe uppercase tracking-wider mb-2">Back (Answer) *</label>
              <textarea placeholder="A function that lets you hook into React state..." className="w-full bg-white border border-taupe/30 rounded-lg px-4 py-3 text-sm text-umber focus:outline-none focus:border-umber h-32 resize-none"></textarea>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="bg-umber text-sand px-6 py-2 rounded-lg font-medium text-xs md:text-sm hover:bg-umber/90 transition-all shadow-sm flex items-center gap-2">
              <Plus size={18} /> Add Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MultiplayerView() {
  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 animate-in fade-in duration-300 items-center pb-12">
      <div className="bg-white border border-taupe/30 p-6 md:p-8 rounded-2xl shadow-sm text-center">
        <div className="w-16 h-16 bg-greige/30 text-umber rounded-full flex items-center justify-center mx-auto mb-6"><Users size={32}/></div>
        <h2 className="text-xl md:text-2xl font-bold text-umber mb-2">Join a Lobby</h2>
        <p className="text-taupe text-xs md:text-sm mb-6">Enter your classmate's 6-digit session pin to join the live quiz.</p>
        <input type="text" placeholder="e.g. 123456" className="w-full text-center text-xl md:text-2xl tracking-[0.5em] font-mono bg-sand/30 border border-taupe/40 rounded-xl py-3 md:py-4 mb-4 focus:outline-none focus:border-umber" />
        <button className="w-full bg-umber text-sand py-3 rounded-xl font-medium text-sm hover:bg-umber/90">Join Session</button>
      </div>
      <div className="bg-sand/40 border border-taupe/30 p-6 md:p-8 rounded-2xl shadow-sm text-center h-full flex flex-col justify-center">
        <h2 className="text-xl md:text-2xl font-bold text-umber mb-2">Host a Lobby</h2>
        <p className="text-taupe text-xs md:text-sm mb-6">Select one of your existing decks and challenge your friends in real-time.</p>
        <button className="w-full bg-white border-2 border-umber text-umber py-3 rounded-xl font-medium text-sm hover:bg-umber/5">Select Deck to Host</button>
      </div>
    </div>
  );
}

function DeckDetailsView({ navigateTo, activeDeck, setIsTutorOpen }) {
  if (!activeDeck) return null;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-taupe/20 pb-6">
        <div>
          <button onClick={() => navigateTo('decks')} className="flex items-center gap-2 text-taupe hover:text-umber transition-colors font-medium mb-3 text-sm"><ArrowLeft size={16} /> Back to Library</button>
          <h2 className="text-2xl md:text-3xl font-bold text-umber mb-2">{activeDeck.title}</h2>
          <div className="flex flex-wrap gap-3 text-xs md:text-sm font-medium text-taupe items-center">
            <span className="bg-sand px-2 py-1 rounded text-umber">{activeDeck.cards.length} Cards</span>
            <span>Created {activeDeck.createdAt}</span>
            <span className="flex items-center gap-1"><BookOpen size={14} /> {activeDeck.visibility}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-taupe hover:text-umber hover:bg-greige/20 rounded-lg transition-colors"><Edit3 size={20} /></button>
          <button className="p-2 text-taupe hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={20} /></button>
        </div>
      </div>

      <div className="bg-amber-50/50 border border-amber-600/30 rounded-2xl p-5 md:p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0"><Sparkles size={24} /></div>
          <div>
            <h3 className="font-bold text-base md:text-lg text-umber">Professor AI is ready</h3>
            <p className="text-taupr text-xs md:text-sm">Need a mnemonic device or a simplified breakdown before you start?</p>
          </div>
        </div>
        <button onClick={() => setIsTutorOpen(true)} className="bg-white border border-amber-600/50 text-amber-700 px-4 md:px-5 py-2 rounded-xl font-bold text-xs md:text-sm hover:bg-amber-50 transition-colors shadow-sm whitespace-nowrap">
          Open Chat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div onClick={() => navigateTo('flashcard-mode')} className="bg-white border border-taupe/20 rounded-2xl p-6 shadow-sm hover:border-umber/40 hover:shadow-md cursor-pointer transition-all group">
          <div className="w-10 h-10 bg-greige/30 text-umber rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Layers size={20} /></div>
          <h3 className="font-bold text-lg md:text-xl text-umber mb-2">Deep Dive (Flashcards)</h3>
          <p className="text-taupe text-xs md:text-sm mb-4">Flip through cards and rate your confidence to train the spaced-repetition algorithm.</p>
          <span className="text-xs font-bold text-umber uppercase tracking-wider">Start Review →</span>
        </div>
        <div onClick={() => navigateTo('quiz-setup')} className="bg-white border border-taupe/20 rounded-2xl p-6 shadow-sm hover:border-umber/40 hover:shadow-md cursor-pointer transition-all group">
          <div className="w-10 h-10 bg-greige/30 text-umber rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><CheckCircle size={20} /></div>
          <h3 className="font-bold text-lg md:text-xl text-umber mb-2">Knowledge Check (Quiz)</h3>
          <p className="text-taupe text-xs md:text-sm mb-4">Test yourself with dynamically generated multiple-choice and identification questions.</p>
          <span className="text-xs font-bold text-umber uppercase tracking-wider">Configure Quiz →</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-base md:text-lg text-umber">Card Inventory</h3>
        </div>
        <div className="space-y-3">
          {activeDeck.cards.map((card) => (
            <div key={card.id} className="bg-white border border-taupe/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 md:gap-6 hover:bg-sand/10 transition-colors">
              <div className="flex-1 md:border-r md:border-taupe/20 md:pr-6">
                <p className="text-xs font-bold text-taupe uppercase tracking-wider mb-1">Term</p>
                <p className="text-umber font-medium text-sm md:text-base">{card.term}</p>
              </div>
              <div className="flex-[2]">
                <p className="text-xs font-bold text-taupe uppercase tracking-wider mb-1">Definition</p>
                <p className="text-umber text-xs md:text-sm">{card.definition}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FlashcardModeView({ navigateTo, activeDeck, setIsTutorOpen }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [cardOrder, setCardOrder] = useState(() => [...Array(activeDeck?.cards.length || 0).keys()]);
  const [autoSpeed, setAutoSpeed] = useState(0);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef(null);

  useEffect(() => {
    if (autoSpeed === 0) {
      setProgress(0);
      return;
    }

    const updateInterval = 50;
    const totalMs = autoSpeed * 1000;
    const increment = (updateInterval / totalMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (!isFlipped) {
            setIsFlipped(true);
            return 0;
          } else {
            if (currentIndex < activeDeck.cards.length - 1) {
              setIsFlipped(false);
              setCurrentIndex(idx => idx + 1);
              return 0;
            } else {
              setAutoSpeed(0);
              return 0;
            }
          }
        }
        return prev + increment;
      });
    }, updateInterval);

    return () => clearInterval(timer);
  }, [autoSpeed, isFlipped, currentIndex, activeDeck]);

  if (!activeDeck) return null;

  const currentCard = activeDeck.cards[cardOrder[currentIndex]];

  const cycleAutoSpeed = () => {
    if (autoSpeed === 0) setAutoSpeed(3);
    else if (autoSpeed === 3) setAutoSpeed(5);
    else if (autoSpeed === 5) setAutoSpeed(10);
    else setAutoSpeed(0);
    setProgress(0);
  };

  const handleManualAction = (action) => {
    setProgress(0);
    action();
  };

  const handleNext = () => handleManualAction(() => {
    setIsFlipped(false);
    if (currentIndex < activeDeck.cards.length - 1) setCurrentIndex(prev => prev + 1);
  });

  const handlePrev = () => handleManualAction(() => {
    setIsFlipped(false);
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  });

  const handleFlip = () => handleManualAction(() => {
    setIsFlipped(!isFlipped);
  });

  const toggleShuffle = () => {
    if (!isShuffled) {
      const shuffled = [...cardOrder].sort(() => Math.random() - 0.5);
      setCardOrder(shuffled);
    } else {
      setCardOrder([...Array(activeDeck.cards.length).keys()]);
    }
    setIsShuffled(!isShuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setProgress(0);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setAutoSpeed(0);
    setProgress(0);
    setCardOrder([...Array(activeDeck.cards.length).keys()]);
    setIsShuffled(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="max-w-4xl w-full mx-auto flex flex-col items-center animate-in fade-in duration-300 h-full min-h-[75vh] bg-white p-4 md:p-6 rounded-2xl">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-taupe/20 pb-4">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <button onClick={() => navigateTo('deck-details')} className="text-taupe hover:text-umber transition-colors mr-1">
            <ArrowLeft size={20}/>
          </button>
          
          <div className="flex flex-wrap gap-1.5 sm:border-r sm:border-taupe/20 sm:pr-4">
            <button onClick={cycleAutoSpeed} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors ${autoSpeed > 0 ? 'bg-amber-100 text-amber-700 shadow-sm border border-amber-200' : 'text-taupe hover:bg-greige/20'}`}>
              <Clock size={13} /> {autoSpeed > 0 ? `${autoSpeed}s` : 'Auto'}
            </button>
            <button onClick={toggleShuffle} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors ${isShuffled ? 'bg-amber-100 text-amber-700 shadow-sm border border-amber-200' : 'text-taupe hover:bg-greige/20'}`}>
              <Shuffle size={13} /> Shuffle
            </button>
            <button onClick={handleReset} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-taupe hover:bg-greige/20 transition-colors">
              <RotateCcw size={13} /> Reset
            </button>
            <button onClick={toggleFullscreen} className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-taupe hover:bg-greige/20 transition-colors">
              <Maximize size={13} /> Focus
            </button>
          </div>
          
          <span className="font-bold text-umber tracking-wide bg-greige/20 px-3 py-1 rounded-lg text-xs">
            Card {currentIndex + 1} / {activeDeck.cards.length}
          </span>
        </div>
        
        <div>
          <button onClick={() => setIsTutorOpen(true)} className="px-3.5 py-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm">
            <HelpCircle size={15} /> Ask AI
          </button>
        </div>
      </div>

      <div onClick={handleFlip} className="w-full max-w-2xl flex-1 bg-white border border-taupe/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:shadow-xl hover:border-taupe/60 transition-all duration-300 relative group shadow-sm overflow-hidden p-6 text-center my-auto min-h-[220px]">
        <span className="absolute top-4 left-4 text-[10px] md:text-xs font-bold text-taupe tracking-widest uppercase">{isFlipped ? "Definition" : "Term"}</span>
        <h3 className="text-xl md:text-3xl font-medium text-umber px-4 leading-relaxed">
          {isFlipped ? currentCard.definition : currentCard.term}
        </h3>
        
        {autoSpeed === 0 && (
          <div className="absolute bottom-4 text-taupe/70 text-xs flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity font-medium bg-sand px-3 py-1 rounded-full">
            Click to flip
          </div>
        )}

        {autoSpeed > 0 && (
          <>
            <div className="absolute bottom-4 left-6 text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
              <RotateCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
              {isFlipped ? "Moving to next..." : "Auto-flipping..."}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-greige/30">
              <div className="h-full bg-amber-500 transition-all ease-linear" style={{ width: `${progress}%`, transitionDuration: '50ms' }}></div>
            </div>
          </>
        )}
      </div>
      
      <div className="h-20 mt-6 flex items-center justify-center w-full max-w-2xl">
        {!isFlipped ? (
          <div className="flex gap-8 md:gap-12 text-taupe">
            <button onClick={handlePrev} disabled={currentIndex === 0} className="hover:text-umber transition-colors disabled:opacity-30"><ChevronLeft size={30}/></button>
            <button onClick={handleNext} disabled={currentIndex === activeDeck.cards.length - 1} className="hover:text-umber transition-colors disabled:opacity-30"><ChevronRight size={30}/></button>
          </div>
        ) : (
          <div className="flex gap-2 md:gap-4 w-full animate-in slide-in-from-bottom-2 duration-200">
            <button onClick={handleNext} className="flex-1 bg-rose-50 text-rose-700 border border-rose-200 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm hover:bg-rose-100 transition-colors">Hard (1m)</button>
            <button onClick={handleNext} className="flex-1 bg-white border border-taupe/30 text-umber py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm hover:bg-greige/10 transition-colors">Good (10m)</button>
            <button onClick={handleNext} className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm hover:bg-emerald-100 transition-colors">Easy (4d)</button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuizSetupView({ navigateTo }) {
  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300 pb-12">
      <button onClick={() => navigateTo('deck-details')} className="flex items-center gap-2 text-taupe hover:text-umber transition-colors font-medium mb-6 text-sm">
        <ArrowLeft size={16} /> Back to Deck
      </button>

      <h2 className="text-2xl md:text-3xl font-bold text-umber mb-2">Configure Challenge</h2>
      <p className="text-taupe text-xs md:text-sm mb-6">Select the question types you want to include in this quiz session.</p>

      <div className="bg-white border border-taupe/30 rounded-2xl p-4 md:p-6 shadow-sm space-y-4 mb-8">
        <div className="flex items-start gap-4 p-4 border border-umber text-umber bg-sand/30 rounded-xl cursor-pointer">
          <div className="mt-1"><div className="w-5 h-5 rounded border-2 border-umber flex items-center justify-center"><div className="w-2.5 h-2.5 bg-umber rounded-sm"></div></div></div>
          <div>
            <h4 className="font-bold text-base md:text-lg mb-1">Multiple Choice</h4>
            <p className="text-xs md:text-sm text-umber/80">Pick the correct answer from 4 generated options.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 border border-taupe/20 text-taupe bg-greige/5 rounded-xl cursor-not-allowed opacity-60">
          <div className="mt-1"><div className="w-5 h-5 rounded border-2 border-taupe/40"></div></div>
          <div>
            <h4 className="font-bold text-base md:text-lg mb-1 flex items-center gap-2">True / False <span className="text-[10px] bg-taupe/20 px-2 py-0.5 rounded text-taupe">Needs 4+ Cards</span></h4>
            <p className="text-xs md:text-sm">Evaluate whether an AI-generated statement is correct.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 border border-umber text-umber bg-sand/30 rounded-xl cursor-pointer">
          <div className="mt-1"><div className="w-5 h-5 rounded border-2 border-umber flex items-center justify-center"><div className="w-2.5 h-2.5 bg-umber rounded-sm"></div></div></div>
          <div>
            <h4 className="font-bold text-base md:text-lg mb-1">Identification</h4>
            <p className="text-xs md:text-sm text-umber/80">Type the exact answer from memory.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button className="flex-1 bg-white border-2 border-taupe/30 text-umber py-3.5 rounded-xl font-bold hover:bg-greige/10 transition-colors text-base">
          Sequential Order
        </button>
        <button className="flex-1 bg-umber text-sand py-3.5 rounded-xl font-bold hover:bg-umber/90 transition-colors shadow-md text-base">
          Start Randomized
        </button>
      </div>
    </div>
  );
}