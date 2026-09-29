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

export function HubDetailsView({ navigateTo, activeHub }) {
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
    <div className="max-w-5xl mx-auto relative p-4 md:p-8">
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
              <button onClick={() => { navigator.clipboard.writeText(activeHub.inviteCode); toast.success("Invite code copied"); }} className="text-taupe dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"><Copy size={16}/></button>
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

      <Card className="border-2 border-dashed border-taupe/30 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 p-12 text-center flex flex-col items-center justify-center rounded-3xl">
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
