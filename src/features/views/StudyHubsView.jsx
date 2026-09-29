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

export function StudyHubsView({ navigateTo, setActiveHub, myHubs }) {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-umber dark:text-zinc-100 mb-1">Collaborative Study Hubs</h2>
          <p className="text-taupe dark:text-zinc-400 text-sm">Join classrooms, pool notes, and study together.</p>
        </div>
        <Button onClick={() => navigateTo('create-hub')} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 font-medium rounded-lg h-10 px-4 shadow-sm text-sm">
          <Plus size={18} className="mr-2" /> Create Hub
        </Button>
      </div>

      <Card className="bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 mb-10 shadow-sm text-umber dark:text-zinc-100">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0"><Share2 size={24} /></div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-lg text-umber dark:text-zinc-100 mb-1">Join a Class Hub</h3>
            <p className="text-taupe dark:text-zinc-400 text-sm">Got an invite link or access code? Enter it below.</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <Input type="text" placeholder="e.g. BSIT-3A-26" className="flex-1 md:w-48 bg-white dark:bg-zinc-950 border-taupe/30 dark:border-zinc-800 h-12 rounded-xl text-umber dark:text-zinc-100 focus-visible:ring-blue-400" />
            <Button variant="outline" className="h-12 px-6 rounded-xl font-bold text-umber dark:text-zinc-100 bg-white dark:bg-zinc-900 hover:bg-greige/10 dark:hover:bg-zinc-800 border-taupe/30 dark:border-zinc-700 shadow-sm">Join</Button>
          </div>
        </CardContent>
      </Card>

      {myHubs.length === 0 ? (
        <Card className="border-2 border-dashed border-taupe/30 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 p-12 text-center flex flex-col items-center justify-center rounded-3xl">
            <div className="w-16 h-16 bg-greige/30 dark:bg-zinc-800 text-umber dark:text-zinc-400 rounded-full flex items-center justify-center mb-4"><Users size={32} /></div>
            <CardTitle className="text-xl text-umber dark:text-zinc-100 mb-2">No active hubs</CardTitle>
            <CardDescription className="text-taupe dark:text-zinc-400 mb-6 max-w-md mx-auto">Create a new hub to invite classmates or enter an access code above to join an existing one.</CardDescription>
        </Card>
      ) : (
        <>
          <p className="text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-4">Your Active Hubs ({myHubs.length})</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myHubs.map(hub => (
              <Card key={hub.id} onClick={() => { setActiveHub(hub); navigateTo('hub-details'); }} className="bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer relative group flex flex-col justify-between min-h-[180px] rounded-2xl">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-umber dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-4">{hub.name}</h3>
                    <Badge variant={hub.role === 'Admin' ? 'default' : 'secondary'} className={hub.role === 'Admin' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50' : 'bg-greige/30 dark:bg-zinc-800 text-umber dark:text-zinc-300 hover:bg-greige/30 dark:hover:bg-zinc-800 uppercase tracking-widest text-[10px] border-none'}>{hub.role}</Badge>
                  </div>
                  <p className="text-sm text-taupe dark:text-zinc-400 line-clamp-2">{hub.description}</p>
                </CardContent>
                <CardFooter className="pt-4 border-t border-taupe/10 dark:border-zinc-800 text-sm font-medium text-umber dark:text-zinc-300 gap-5 mt-4">
                  <span className="flex items-center gap-1.5"><BookOpen size={16} className="text-taupe dark:text-zinc-500" /> {hub.decks} Decks</span>
                  <span className="flex items-center gap-1.5"><Users size={16} className="text-taupe dark:text-zinc-500" /> {hub.members} Members</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
