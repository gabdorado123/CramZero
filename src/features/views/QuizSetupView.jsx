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

export function QuizSetupView({ navigateTo, setExamConfig }) {
  const [qCount, setQCount] = useState(10);

  const handleStart = (isRandom) => {
    setExamConfig({ count: qCount, timeMode: 'No Limit', isMock: false });
    navigateTo('mock-exam-active');
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300 p-4 md:p-8">
      <Button variant="ghost" onClick={() => navigateTo('study')} className="-ml-4 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 mb-6 font-medium">
        <ArrowLeft size={16} className="mr-2" /> Back to Study View
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
