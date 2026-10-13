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

export function MockExamSetupView({ navigateTo, activeDeck, setExamConfig }) {
  const safeDeck = activeDeck || { title: "Loading Assessment..." };
  const [qCount, setQCount] = useState(25);
  const [timeLimit, setTimeLimit] = useState('60 mins');

  const handleStart = () => {
    setExamConfig({ count: qCount, timeMode: timeLimit, isMock: true });
    navigateTo('mock-exam-active');
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300 p-4 md:p-8">
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
