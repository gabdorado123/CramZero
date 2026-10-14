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
import { API_BASE } from '@/lib/api';

export function StudyHubsView({ navigateTo, setActiveHub, myHubs, userId, displayName }) {
  const [inviteCode, setInviteCode] = useState('');

  const handleJoin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/study-hubs/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: inviteCode.trim(), user_id: userId, display_name: displayName }),
      });
      const joinedHub = await response.json();
      if (!response.ok) throw new Error(joinedHub.detail || 'Check the invite code and try again.');
      setActiveHub(joinedHub);
      setInviteCode('');
      toast.success('Hub joined', { description: `You can now access ${joinedHub.name}.` });
      navigateTo('hub-details');
    } catch (error) {
      toast.error('Could not join hub', { description: error.message });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-stone-200/60 dark:border-zinc-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-umber dark:text-zinc-100 tracking-tight">Collaborative Study Hubs</h2>
          <p className="text-taupe dark:text-zinc-400 text-xs sm:text-sm mt-0.5">Join classrooms, pool notes, and study together.</p>
        </div>
        <Button onClick={() => navigateTo('create-hub')} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 font-semibold rounded-full h-11 px-6 shadow-sm text-sm w-full sm:w-auto">
          <Plus size={18} className="mr-2" /> Create Hub
        </Button>
      </div>

      <Card data-tour="study-hubs" className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-blue-50/70 dark:from-blue-950/40 dark:via-zinc-900 dark:to-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 shadow-sm text-umber dark:text-zinc-100 rounded-3xl overflow-hidden backdrop-blur-sm">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border border-blue-200/60 dark:border-blue-500/20">
            <Share2 size={26} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-lg md:text-xl text-umber dark:text-zinc-100 mb-1">Join a Class Hub</h3>
            <p className="text-taupe dark:text-zinc-400 text-sm">Got an invite link or access code? Enter it below to sync cards.</p>
          </div>
          <form onSubmit={handleJoin} className="flex w-full md:w-auto gap-2">
            <Input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} type="text" placeholder="e.g. BSIT-3A-26" aria-label="Hub invite code" className="flex-1 md:w-52 bg-white/95 dark:bg-zinc-900/95 border-stone-200 dark:border-zinc-800 h-11 rounded-full px-4 text-umber dark:text-zinc-100 focus-visible:ring-blue-400" />
            <Button type="submit" disabled={!inviteCode.trim()} className="h-11 px-6 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-xs">Join</Button>
          </form>
        </CardContent>
      </Card>

      {myHubs.length === 0 ? (
        <Card className="border-2 border-dashed border-stone-200 dark:border-zinc-800 shadow-none bg-white/50 dark:bg-zinc-900/50 p-12 text-center flex flex-col items-center justify-center rounded-3xl">
            <div className="w-16 h-16 bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 rounded-2xl flex items-center justify-center mb-4"><Users size={32} /></div>
            <CardTitle className="text-xl text-umber dark:text-zinc-100 mb-2">No active hubs</CardTitle>
            <CardDescription className="text-taupe dark:text-zinc-400 mb-6 max-w-md mx-auto">Create a new hub to invite classmates or enter an access code above to join an existing one.</CardDescription>
        </Card>
      ) : (
        <>
          <p className="text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-4">Your Active Hubs ({myHubs.length})</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myHubs.map(hub => (
              <Card key={hub.id} onClick={() => { setActiveHub(hub); navigateTo('hub-details'); }} className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-stone-200/90 dark:border-white/10 hover:shadow-xl hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all duration-300 cursor-pointer relative group flex flex-col justify-between min-h-[180px] rounded-3xl hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-umber dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-4">{hub.name}</h3>
                    <Badge variant={hub.role === 'Admin' ? 'default' : 'secondary'} className={hub.role === 'Admin' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full px-3 py-1 font-semibold text-xs border border-blue-200/60 dark:border-blue-800' : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 rounded-full px-3 py-1 uppercase tracking-wider text-[10px] font-semibold border-none'}>{hub.role}</Badge>
                  </div>
                  <p className="text-sm text-taupe dark:text-zinc-400 line-clamp-2">{hub.description}</p>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-0 flex items-center gap-5 border-t border-stone-100 dark:border-zinc-800/80 pt-4 text-sm font-medium text-umber dark:text-zinc-300">
                  <span className="flex items-center gap-1.5 text-xs text-taupe dark:text-zinc-400"><BookOpen size={15} /> {hub.sharedDecks?.length ?? hub.decks ?? 0} Decks</span>
                  <span className="flex items-center gap-1.5 text-xs text-taupe dark:text-zinc-400"><Users size={15} /> {hub.members} Members</span>
                  <Button variant="ghost" size="sm" title="Copy share link" onClick={(event) => { event.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}?hub=${hub.inviteCode}`); toast.success('Share link copied'); }} className="ml-auto h-8 gap-1.5 px-3 rounded-full text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30"><LinkIcon size={13} /> Share link</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
