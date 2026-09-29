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

export function DashboardView({ navigateTo, setHasActiveDeck, myDecks }) {
  const handleStartStudying = () => { setHasActiveDeck(true); navigateTo('study'); };
  
  if (myDecks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] max-w-6xl mx-auto">
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
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
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
