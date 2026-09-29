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

export function LandingPageView({ navigateTo, isDarkMode, setIsDarkMode }) {
  const [typedText, setTypedText] = useState('');
  const [activeStudyTab, setActiveStudyTab] = useState(1);
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

      <section id="study-ways" className="px-4 md:px-8 py-16 md:py-20 max-w-6xl mx-auto w-full">
        <div className="mb-10 text-center md:text-left">
          <span className="text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-widest">See it in action</span>
          <h2 className="text-3xl md:text-4xl font-black text-umber dark:text-zinc-100 mt-2">Study your way.</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-3">
            {[
              { id: 1, title: 'Flashcard Review', desc: 'Tap to flip cards. Self-rate confidence to train spaced repetition.' },
              { id: 2, title: 'Auto-generated Quizzes', desc: 'Multiple choice & identification questions generated straight from files.' },
              { id: 3, title: 'Professor Zero AI Tutor', desc: 'Chat with an AI that has complete context of your uploaded study material.' },
              { id: 4, title: 'File Ingestion & Generation', desc: 'Drop PDFs, PPTX lecture slides, JSON or TXT to build decks instantly.' },
            ].map((tab) => (
              <div key={tab.id} onClick={() => setActiveStudyTab(tab.id)} className={`p-4 md:p-5 rounded-2xl border cursor-pointer transition-all ${activeStudyTab === tab.id ? 'bg-white dark:bg-zinc-900 border-umber dark:border-zinc-600 shadow-md lg:translate-x-2' : 'bg-sand/40 dark:bg-zinc-900/40 border-taupe/20 dark:border-zinc-800 hover:bg-white/60 dark:hover:bg-zinc-800 text-taupe dark:text-zinc-400'}`}>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${activeStudyTab === tab.id ? 'bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900' : 'bg-taupe/30 dark:bg-zinc-800 text-umber dark:text-zinc-300'}`}>{tab.id}</span>
                  <h3 className={`font-bold text-base md:text-lg ${activeStudyTab === tab.id ? 'text-umber dark:text-zinc-100' : 'text-taupe dark:text-zinc-400'}`}>{tab.title}</h3>
                </div>
                <p className="text-xs text-taupe dark:text-zinc-400 ml-9 leading-relaxed">{tab.desc}</p>
              </div>
            ))}
          </div>
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-taupe/30 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl min-h-[380px] flex flex-col justify-center relative overflow-hidden animate-in fade-in duration-300">
            {activeStudyTab === 1 && (
              <div className="space-y-6">
                <div className="text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider">Flashcard • Data Structures</div>
                <div className="bg-sand/30 dark:bg-zinc-950 border border-taupe/20 dark:border-zinc-800 p-6 md:p-8 rounded-2xl text-center space-y-3">
                  <p className="text-base md:text-lg font-bold text-umber dark:text-zinc-100">What is the worst-case time complexity of quicksort when pivot selection fails consistently?</p>
                  <p className="text-xs text-taupe dark:text-zinc-500 italic">Tap to reveal answer</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 py-2 rounded-xl text-xs font-bold">Hard (1m)</button>
                  <button className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-500 py-2 rounded-xl text-xs font-bold">Good (10m)</button>
                  <button className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 py-2 rounded-xl text-xs font-bold">Easy (4d)</button>
                </div>
              </div>
            )}
            {activeStudyTab === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider"><span>Quiz Mode</span><span>Question 2 of 5</span></div>
                <h3 className="font-bold text-base md:text-lg text-umber dark:text-zinc-100">Which data structure operates on a Last-In, First-Out (LIFO) basis?</h3>
                <div className="space-y-2">{['Queue', 'Stack', 'Array', 'Graph'].map((opt, i) => (<div key={i} className={`p-3 rounded-xl border text-sm font-medium ${i === 1 ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-500 dark:border-amber-600 text-umber dark:text-amber-100' : 'bg-sand/20 dark:bg-zinc-950 border-taupe/20 dark:border-zinc-800 text-taupe dark:text-zinc-400'}`}>{opt}</div>))}</div>
              </div>
            )}
            {activeStudyTab === 3 && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider">Professor Zero AI Tutor</div>
                <div className="space-y-3 bg-greige/10 dark:bg-zinc-950 p-4 rounded-2xl border border-taupe/20 dark:border-zinc-800">
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl text-xs text-umber dark:text-zinc-200 shadow-sm max-w-[85%]">Can you explain pointer arithmetic simply?</div>
                  <div className="bg-umber dark:bg-zinc-200 text-sand dark:text-zinc-900 p-3 rounded-xl text-xs shadow-sm max-w-[85%] ml-auto">Pointers store memory addresses. Adding 1 to a pointer advances it by the byte size of its data type!</div>
                </div>
              </div>
            )}
            {activeStudyTab === 4 && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider">Universal File Ingestion</div>
                <div className="bg-sand/30 dark:bg-zinc-950 border border-taupe/20 dark:border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                  <UploadCloud size={32} className="text-umber dark:text-zinc-400 mb-2" />
                  <p className="font-bold text-umber dark:text-zinc-200 text-sm">Drop your .PDF, .PPTX, .JSON, or .TXT</p>
                  <p className="text-xs text-taupe dark:text-zinc-500 mt-1">Instant structural parsing & flashcard compilation</p>
                </div>
              </div>
            )}
          </div>
        </div>
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
          <div className="bg-white dark:bg-zinc-900 border border-taupe/20 dark:border-zinc-800 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-500 rounded-2xl flex items-center justify-center mb-6"><Mic size={24} /></div>
              <h3 className="font-bold text-lg md:text-xl text-umber dark:text-zinc-100 mb-2">Vocal Language Partner</h3>
              <p className="text-taupe dark:text-zinc-400 text-sm leading-relaxed">Web Speech API lets Professor AI speak definitions aloud and listen to your oral responses.</p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-taupe/20 dark:border-zinc-800 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-greige/30 dark:bg-zinc-800 text-umber dark:text-zinc-300 rounded-2xl flex items-center justify-center mb-6"><Zap size={24} /></div>
              <h3 className="font-bold text-lg md:text-xl text-umber dark:text-zinc-100 mb-2">Multiplayer Lobbies</h3>
              <p className="text-taupe dark:text-zinc-400 text-sm leading-relaxed">Host live quiz rooms with classmates using a 6-digit session pin for high-stakes battles.</p>
            </div>
          </div>
          <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-taupe/20 dark:border-zinc-800 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-taupe/10 dark:text-zinc-800 transition-colors pointer-events-none"><Timer size={120} /></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-6"><Timer size={24} /></div>
              <h3 className="font-bold text-xl md:text-2xl text-umber dark:text-zinc-100 mb-2">AI Mock Exam Simulator</h3>
              <p className="text-taupe dark:text-zinc-400 text-sm md:text-base max-w-lg leading-relaxed">Turn your decks into high-stakes timed exams. CramZero generates novel scenarios and trick questions based strictly on your notes.</p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-taupe/20 dark:border-zinc-800 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6"><PieChart size={24} /></div>
              <h3 className="font-bold text-lg md:text-xl text-umber dark:text-zinc-100 mb-2">Mastery Analytics</h3>
              <p className="text-taupe dark:text-zinc-400 text-sm leading-relaxed">Track your study streaks, monitor card maturity levels, and visualize your knowledge retention funnel.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="px-4 md:px-8 py-16 md:py-20 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest">Transparency & Tech</span>
          <h2 className="text-3xl md:text-4xl font-black text-umber dark:text-zinc-100 mt-2">Frequently Asked Questions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { q: "Do I need to create an account to start?", a: "No! CramZero is completely account-free by design. You can drop files, generate decks, and study right in your browser instantly." },
            { q: "What file formats are supported for upload generation?", a: "You can upload PDF documents, PowerPoint (.pptx) presentation slides, plain text (.txt), and JSON exports." },
            { q: "How do Study Hubs work?", a: "You can create a hub for your specific class. By sharing the invite link, classmates can join and any deck uploaded to the hub is instantly synced for everyone." },
            { q: "Is CramZero free for students?", a: "Yes, 100% free for all students with full access to flashcard reviews, quizzes, and multiplayer battle rooms." }
          ].map((faq, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-taupe/20 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-umber dark:text-zinc-100 text-sm md:text-base mb-2 flex items-center gap-2"><HelpCircle size={18} className="text-taupe dark:text-zinc-500 shrink-0" /> {faq.q}</h3>
              <p className="text-taupe dark:text-zinc-400 text-xs md:text-sm leading-relaxed ml-6">{faq.a}</p>
            </div>
          ))}
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
