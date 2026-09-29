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

export function CreateHubView({ navigateTo, myHubs, setMyHubs, setIsActionLoading, setActionMessage }) {
  const [selectedDeckOption, setSelectedDeckOption] = useState(null);
  const [hubName, setHubName] = useState('');
  const [hubDesc, setHubDesc] = useState('');

  const handleCreate = () => {
    if(!hubName.trim()) return;
    
    setIsActionLoading(true);
    setActionMessage('Setting up your collaborative space...');
    
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
      setIsActionLoading(false);
      toast.success("Study Hub created!", {
        description: `${hubName} is now ready for collaboration.`
      });
      navigateTo('hubs');
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 p-4 md:p-8">
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
            <Button type="submit" disabled={!hubName.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-xl font-bold shadow-sm disabled:opacity-50">Create Hub</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
