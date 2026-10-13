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
import { recordAnalyticsEvent } from '@/lib/analytics';

export function MockExamActiveView({ navigateTo, activeDeck, examConfig }) {
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
    
    if (timeLeftSeconds <= 0) {
      setIsFinished(true);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeftSeconds(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeftSeconds, isFinished]); 

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelect = (opt) => {
    if (answers[currentIndex] !== undefined || isFinished) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: opt }));
    recordAnalyticsEvent({
      type: 'quiz_answer',
      deckId: safeDeck.id || 'unknown-deck',
      deckTitle: safeDeck.title || 'Untitled deck',
      term: questions[currentIndex]?.question || `Question ${currentIndex + 1}`,
      correct: opt === questions[currentIndex]?.answer,
      mode: examConfig?.isMock ? 'mock-exam' : 'quiz',
    });
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
      <div className="max-w-4xl mx-auto w-full flex flex-col pb-12 pt-6 px-4">
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
    <div className="max-w-4xl w-full mx-auto flex flex-col h-[calc(100vh-10rem)] relative">
      
      {/* Premium, Left-Aligned Sticky Header */}
      <div className="bg-sand/90 dark:bg-zinc-950/90 backdrop-blur-md pb-4 mb-6 border-b border-taupe/20 dark:border-zinc-800 flex justify-between items-end transition-colors shrink-0 px-2 md:px-0">
        <div>
          <p className="text-[10px] font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
            <CheckCircle size={12}/> {examConfig?.isMock ? 'Mock Exam' : 'Knowledge Check'} • Question {currentIndex + 1} of {questions.length}
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-umber dark:text-zinc-100 truncate max-w-[250px] md:max-w-md">
            {safeDeck.title}
          </h2>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {timeLeftSeconds !== null && (
            <Badge variant="outline" className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono font-bold text-sm md:text-base border-taupe/30 dark:border-zinc-700 ${timeLeftSeconds < 60 ? 'text-rose-600 dark:text-rose-400 animate-pulse bg-rose-50 dark:bg-rose-900/30' : 'text-umber dark:text-zinc-100'}`}>
              <Timer size={16} /> {formatTime(timeLeftSeconds)}
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsFinished(true)} className="text-taupe dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 -mr-2" title="Quit Exam">
            <X size={20} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 px-2 md:px-0">
        <Card className="rounded-3xl p-6 md:p-10 shadow-md flex flex-col mb-8 bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800">
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
      </div>

      <div className="sticky bottom-0 left-0 w-full bg-sand/90 dark:bg-zinc-950/90 backdrop-blur-md py-4 z-20 flex justify-between items-center border-t border-taupe/20 dark:border-zinc-800 mt-auto transition-colors px-2 md:px-0">
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

// ---------------------------------------------------------------------------
// MULTIPLAYER VIEW ENGINE
// ---------------------------------------------------------------------------
