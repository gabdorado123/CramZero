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

export function CreateHubView({ navigateTo, myHubs, setMyHubs, myDecks, setMyDecks, userId, displayName, setIsActionLoading, setActionMessage }) {
  const [selectedDeckOption, setSelectedDeckOption] = useState(null);
  const [generationMode, setGenerationMode] = useState('file');
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [aiTopic, setAiTopic] = useState('');
  const [hubName, setHubName] = useState('');
  const [hubDesc, setHubDesc] = useState('');
  const [allowMemberUploads, setAllowMemberUploads] = useState(true);
  const fileInputRef = useRef(null);

  const handleCreate = async () => {
    if (!hubName.trim()) return;

    const selectedDeck = selectedDeckOption === 'existing'
      ? myDecks.find(deck => String(deck.id) === selectedDeckId)
      : null;

    if (selectedDeckOption === 'existing' && !selectedDeck) {
      toast.error('Choose an existing deck', { description: 'Select a deck before creating the hub.' });
      return;
    }
    if (selectedDeckOption === 'generate' && generationMode === 'file' && !selectedFile) {
      toast.error('Choose a file', { description: 'Select a PDF, PPTX, or TXT file before creating the hub.' });
      return;
    }
    if (selectedDeckOption === 'generate' && generationMode === 'prompt' && !aiTopic.trim()) {
      toast.error('Enter a study topic', { description: 'Tell Zero AI what the first shared deck should cover.' });
      return;
    }
    
    setIsActionLoading(true);
    setActionMessage(selectedDeckOption === 'generate' ? 'Generating and attaching your first deck...' : 'Setting up your collaborative space...');

    try {
      let initialSharedDeck = selectedDeck;
      if (selectedDeckOption === 'generate') {
        let generatedResponse;
        if (generationMode === 'file') {
          const formData = new FormData();
          formData.append('file', selectedFile);
          formData.append('card_count', '10');
          generatedResponse = await fetch('http://127.0.0.1:8000/api/generate-deck-from-file/', { method: 'POST', body: formData });
        } else {
          generatedResponse = await fetch('http://127.0.0.1:8000/api/generate-deck/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: aiTopic.trim(), card_count: 10 }),
          });
        }
        if (!generatedResponse.ok) throw new Error(generationMode === 'file' ? 'The file could not be processed.' : 'The study topic could not be generated.');
        const generatedDeck = await generatedResponse.json();
        const savedResponse = await fetch('http://127.0.0.1:8000/api/decks/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(generatedDeck),
        });
        if (!savedResponse.ok) throw new Error('The generated deck could not be saved.');
        initialSharedDeck = await savedResponse.json();
        setMyDecks(currentDecks => [initialSharedDeck, ...currentDecks]);
      }

      const hubResponse = await fetch('http://127.0.0.1:8000/api/study-hubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: hubName.trim(),
          description: hubDesc.trim() || 'No description provided.',
          owner_id: userId,
          owner_name: displayName,
          allow_member_uploads: allowMemberUploads,
          initial_deck_id: initialSharedDeck?.id || null,
        }),
      });
      const newHub = await hubResponse.json();
      if (!hubResponse.ok) throw new Error(newHub.detail || 'The hub could not be saved.');
      setMyHubs(currentHubs => [newHub, ...currentHubs]);
      setIsActionLoading(false);
      toast.success("Study Hub created!", {
        description: `${hubName} is now ready for collaboration.`
      });
      navigateTo('hubs');
    } catch (error) {
      setIsActionLoading(false);
      toast.error('Could not create hub', { description: error.message });
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 p-4 md:p-8">
      <Button variant="ghost" onClick={() => navigateTo('hubs')} className="mb-6 -ml-4 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100">
        <ArrowLeft size={18} className="mr-2" /> Back to Hubs
      </Button>
      <Card className="p-6 md:p-8 shadow-sm border-taupe/30 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl">
        <div className="flex items-center gap-4 mb-8 border-b border-taupe/20 dark:border-zinc-800 pb-6">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0"><Users size={24} /></div>
          <div><h2 className="text-xl font-bold text-umber dark:text-zinc-100">Create a Study Hub</h2><p className="text-taupe dark:text-zinc-400 text-sm">Set up a collaborative space for your class or study group.</p></div>
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
              <input type="checkbox" checked={allowMemberUploads} onChange={(event) => setAllowMemberUploads(event.target.checked)} className="mt-1" />
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
            {selectedDeckOption === 'existing' && (
              <div className="mt-4 rounded-xl border border-taupe/20 bg-sand/20 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-taupe dark:text-zinc-500">Choose a deck</label>
                <select value={selectedDeckId} onChange={(event) => setSelectedDeckId(event.target.value)} className="h-11 w-full rounded-lg border border-taupe/30 bg-white px-3 text-sm text-umber dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                  <option value="">Select from your library...</option>
                  {myDecks.map(deck => <option key={deck.id} value={deck.id}>{deck.title} ({deck.cards?.length || 0} cards)</option>)}
                </select>
              </div>
            )}
            {selectedDeckOption === 'generate' && (
              <div className="mt-4 rounded-xl border border-amber-600/20 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <div className="mb-4 flex rounded-lg border border-amber-600/20 bg-white/60 p-1 dark:border-amber-900/50 dark:bg-zinc-950/50">
                  <button type="button" onClick={() => setGenerationMode('file')} className={`flex-1 rounded-md px-3 py-2 text-xs font-bold transition-colors ${generationMode === 'file' ? 'bg-amber-600 text-white' : 'text-amber-800 dark:text-amber-400'}`}><UploadCloud size={14} className="mr-1 inline" /> Upload file</button>
                  <button type="button" onClick={() => setGenerationMode('prompt')} className={`flex-1 rounded-md px-3 py-2 text-xs font-bold transition-colors ${generationMode === 'prompt' ? 'bg-amber-600 text-white' : 'text-amber-800 dark:text-amber-400'}`}><Sparkles size={14} className="mr-1 inline" /> Use a prompt</button>
                </div>
                {generationMode === 'file' ? (
                  <>
                    <input ref={fileInputRef} type="file" accept=".pdf,.pptx,.txt" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} className="hidden" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="h-11 rounded-lg border-amber-600/40 text-amber-800 dark:border-amber-700 dark:text-amber-400">{selectedFile ? 'Choose another file' : 'Choose file'}</Button>
                    <p className="mt-2 truncate text-xs text-amber-800/70 dark:text-amber-400/70">{selectedFile?.name || 'No file selected yet.'}</p>
                  </>
                ) : (
                  <Input value={aiTopic} onChange={(event) => setAiTopic(event.target.value)} placeholder="e.g. Windows command line basics" className="h-11 rounded-lg border-amber-600/30 bg-white text-sm text-umber dark:border-amber-900 dark:bg-zinc-950 dark:text-zinc-100" />
                )}
              </div>
            )}
          </div>
          <div className="pt-6 border-t border-taupe/20 dark:border-zinc-800 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => navigateTo('hubs')} className="px-6 h-10 rounded-xl font-bold text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 hover:bg-greige/20 dark:hover:bg-zinc-800">Cancel</Button>
            <Button type="submit" disabled={!hubName.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11 rounded-xl font-bold shadow-sm disabled:opacity-50">Create Hub</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
