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

export function QuizSetupView({ navigateTo, activeDeck, setExamConfig }) {
  const [qCount, setQCount] = useState(10);
  const [qType, setQType] = useState('mc'); // 'mc', 'tf', 'mixed'

  const handleStart = (isRandom) => {
    setExamConfig({ count: qCount, timeMode: 'No Limit', isMock: false, questionType: qType, isRandom });
    navigateTo('mock-exam-active');
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300 p-4 md:p-8">
      <Button 
        variant="ghost" 
        onClick={() => navigateTo(activeDeck ? 'deck-details' : 'study')} 
        className="-ml-4 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 mb-4 font-medium"
      >
        <ArrowLeft size={16} className="mr-2" /> {activeDeck ? `Back to ${activeDeck.title}` : 'Back to Study View'}
      </Button>
      <h2 className="text-2xl md:text-3xl font-bold text-umber dark:text-zinc-100 mb-2">Configure Quiz Challenge</h2>
      <p className="text-taupe dark:text-zinc-400 text-xs md:text-sm mb-6">
        {activeDeck ? (
          <>Testing on: <span className="font-bold text-umber dark:text-zinc-200">{activeDeck.title}</span> ({activeDeck.cards?.length || 0} cards available)</>
        ) : (
          'Select the test parameters and question format for this session.'
        )}
      </p>
      
      {/* Challenge Length Card */}
      <Card className="p-6 md:p-7 shadow-sm mb-6 bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 rounded-3xl">
        <h3 className="font-bold text-umber dark:text-zinc-100 mb-4 flex items-center gap-2 text-base">
          <Target size={18} className="text-amber-500" /> Challenge Length
        </h3>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
          {[5, 10, 20, 30, 50].map(num => (
            <Button 
              key={num}
              variant="outline"
              onClick={() => setQCount(num)}
              className={`flex-1 h-12 font-bold text-sm md:text-base border-2 transition-all rounded-2xl ${qCount === num ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 dark:border-amber-500 text-amber-700 dark:text-amber-400 shadow-xs' : 'border-stone-200 dark:border-zinc-800 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 bg-transparent'}`}
            >
              {num} <span className="hidden sm:inline font-semibold ml-1">Qs</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Question Format Selection */}
      <Card className="p-6 md:p-7 shadow-sm mb-8 bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 rounded-3xl space-y-3">
        <h3 className="font-bold text-umber dark:text-zinc-100 mb-4 flex items-center gap-2 text-base">
          <Layers size={18} className="text-amber-500" /> Question Format
        </h3>

        {/* Multiple Choice */}
        <div 
          onClick={() => setQType('mc')}
          className={`flex items-start gap-4 p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all ${qType === 'mc' ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs' : 'border-stone-200/80 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-zinc-700'}`}
        >
          <div className="mt-0.5">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${qType === 'mc' ? 'border-amber-600 bg-amber-600' : 'border-stone-300 dark:border-zinc-600'}`}>
              {qType === 'mc' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-base text-umber dark:text-zinc-100 mb-0.5 flex items-center gap-2">
              Multiple Choice <Badge className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] rounded-full border-none">Standard</Badge>
            </h4>
            <p className="text-xs md:text-sm text-taupe dark:text-zinc-400">Pick the correct definition from 4 generated options.</p>
          </div>
        </div>

        {/* True / False */}
        <div 
          onClick={() => setQType('tf')}
          className={`flex items-start gap-4 p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all ${qType === 'tf' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs' : 'border-stone-200/80 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-zinc-700'}`}
        >
          <div className="mt-0.5">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${qType === 'tf' ? 'border-emerald-600 bg-emerald-600' : 'border-stone-300 dark:border-zinc-600'}`}>
              {qType === 'tf' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-base text-umber dark:text-zinc-100 mb-0.5 flex items-center gap-2">
              True / False <Badge className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] rounded-full border-none">Active</Badge>
            </h4>
            <p className="text-xs md:text-sm text-taupe dark:text-zinc-400">Evaluate whether an AI-generated statement is accurate or a trick falsehood.</p>
          </div>
        </div>

        {/* Mixed Mode */}
        <div 
          onClick={() => setQType('mixed')}
          className={`flex items-start gap-4 p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all ${qType === 'mixed' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs' : 'border-stone-200/80 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700'}`}
        >
          <div className="mt-0.5">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${qType === 'mixed' ? 'border-blue-600 bg-blue-600' : 'border-stone-300 dark:border-zinc-600'}`}>
              {qType === 'mixed' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-base text-umber dark:text-zinc-100 mb-0.5 flex items-center gap-2">
              Mixed Challenge <Badge className="bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-[10px] rounded-full border-none">Recommended</Badge>
            </h4>
            <p className="text-xs md:text-sm text-taupe dark:text-zinc-400">Combines multiple choice questions and true/false verification for maximum retention.</p>
          </div>
        </div>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={() => handleStart(false)} className="flex-1 h-12 rounded-full font-bold text-sm bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-umber dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800">
          Sequential Order
        </Button>
        <Button onClick={() => handleStart(true)} className="flex-1 bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 h-12 rounded-full font-bold text-sm shadow-sm">
          Start Randomized Challenge →
        </Button>
      </div>
    </div>
  );
}
