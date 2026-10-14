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

export function HubDetailsView({ navigateTo, activeHub, setActiveHub, setMyHubs, myDecks, setMyDecks, setActiveDeck, userId }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [isAddingDeck, setIsAddingDeck] = useState(false);
  const [memberActionId, setMemberActionId] = useState(null);
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [isUpdatingPermission, setIsUpdatingPermission] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!activeHub?.id || !userId) return undefined;
    let isCurrent = true;
    const refreshHub = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/study-hubs/${activeHub.id}?user_id=${encodeURIComponent(userId)}`);
        if (!response.ok) return;
        const nextHub = await response.json();
        if (!isCurrent) return;
        setActiveHub(nextHub);
        setMyHubs(currentHubs => currentHubs.map(hub => hub.id === nextHub.id ? nextHub : hub));
      } catch {
        // Keep the last known hub state while the backend is temporarily unavailable.
      }
    };
    refreshHub();
    const intervalId = window.setInterval(refreshHub, 5000);
    return () => {
      isCurrent = false;
      window.clearInterval(intervalId);
    };
  }, [activeHub?.id, userId, setActiveHub, setMyHubs]);
  
  if (!activeHub) {
    return (
       <div className="max-w-5xl mx-auto p-12 text-center">
         <h2 className="text-xl font-bold text-umber dark:text-zinc-100">Hub Error</h2>
         <Button onClick={() => navigateTo('hubs')} className="mt-4 bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 rounded-xl h-10 px-4">Return</Button>
       </div>
    );
  }

  const sharedDecks = activeHub.sharedDecks || [];
  const members = activeHub.memberList || [];
  const canUploadToHub = activeHub.role === 'Admin' || activeHub.allowMemberUploads !== false;

  const handleUploadPermissionChange = async (allowMemberUploads) => {
    setIsUpdatingPermission(true);
    try {
      const response = await fetch(`${API_BASE}/api/study-hubs/${activeHub.id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, allow_member_uploads: allowMemberUploads }),
      });
      const updatedHub = await response.json();
      if (!response.ok) throw new Error(updatedHub.detail || 'Permission could not be updated.');
      setActiveHub(updatedHub);
      setMyHubs(currentHubs => currentHubs.map(hub => hub.id === updatedHub.id ? updatedHub : hub));
      toast.success(allowMemberUploads ? 'Member uploads enabled' : 'Member uploads disabled');
    } catch (error) {
      toast.error('Could not update upload permission', { description: error.message });
    } finally {
      setIsUpdatingPermission(false);
    }
  };

  const handleMemberAction = async (member, action) => {
    setMemberActionId(member.id);
    try {
      const response = action === 'remove'
        ? await fetch(`${API_BASE}/api/study-hubs/${activeHub.id}/members/${member.id}/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actor_id: userId }),
          })
        : await fetch(`${API_BASE}/api/study-hubs/${activeHub.id}/members/${member.id}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actor_id: userId, role: action }),
          });
      const updatedHub = await response.json();
      if (!response.ok) throw new Error(updatedHub.detail || 'Member action failed.');
      setActiveHub(updatedHub);
      setMyHubs(currentHubs => currentHubs.map(hub => hub.id === updatedHub.id ? updatedHub : hub));
      if (action === 'remove') setPendingRemoval(null);
      toast.success(action === 'remove' ? 'Member removed' : `Member ${action === 'Admin' ? 'promoted' : 'made a member'}`);
    } catch (error) {
      toast.error('Could not update member', { description: error.message });
    } finally {
      setMemberActionId(null);
    }
  };

  const shareDeckToHub = async (deckId) => {
    const response = await fetch(`${API_BASE}/api/study-hubs/${activeHub.id}/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deck_id: deckId, user_id: userId }),
    });
    const updatedHub = await response.json();
    if (!response.ok) throw new Error(updatedHub.detail || 'The deck could not be shared.');
    setActiveHub(updatedHub);
    setMyHubs(currentHubs => currentHubs.map(hub => hub.id === updatedHub.id ? updatedHub : hub));
    return updatedHub;
  };

  const handleShareExistingDeck = async () => {
    const deck = myDecks.find(item => String(item.id) === selectedDeckId);
    if (!deck) return;
    if (sharedDecks.some(item => item.id === deck.id)) {
      toast.info('Deck already shared', { description: `${deck.title} is already in this hub.` });
      return;
    }

    try {
      await shareDeckToHub(deck.id);
      setSelectedDeckId('');
      setShowUploadModal(false);
      toast.success('Deck shared', { description: `${deck.title} is now available in ${activeHub.name}.` });
    } catch (error) {
      toast.error('Could not share deck', { description: error.message });
    }
  };

  const handleGenerateAndShare = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAddingDeck(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('card_count', '10');
      if (userId) formData.append('user_id', userId);
      const generatedResponse = await fetch(`${API_BASE}/api/generate-deck-from-file/`, {
        method: 'POST',
        body: formData,
      });
      if (!generatedResponse.ok) {
        const errData = await generatedResponse.json().catch(() => ({}));
        throw new Error(errData.detail || 'The file could not be processed.');
      }

      const generatedDeck = await generatedResponse.json();
      const savedResponse = await fetch(`${API_BASE}/api/decks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...generatedDeck, user_id: userId }),
      });
      if (!savedResponse.ok) throw new Error('The generated deck could not be saved.');

      const savedDeck = await savedResponse.json();
      setMyDecks(currentDecks => [savedDeck, ...currentDecks]);
      await shareDeckToHub(savedDeck.id);
      setShowUploadModal(false);
      toast.success('Deck generated and shared', { description: `${savedDeck.title} is now available in the hub.` });
    } catch (error) {
      toast.error('Could not share deck', { description: error.message });
    } finally {
      setIsAddingDeck(false);
      event.target.value = '';
    }
  };

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
            <h2 className="text-2xl md:text-3xl font-bold text-umber dark:text-zinc-100 mb-2">{activeHub.name}</h2>
            <p className="text-taupe dark:text-zinc-400 text-sm md:text-base max-w-xl">{activeHub.description}</p>
          </div>
          <div className="bg-sand/40 dark:bg-zinc-950 border border-taupe/30 dark:border-zinc-800 p-4 rounded-xl flex flex-col items-center min-w-[160px]">
            <p className="text-[10px] font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest mb-1">Invite Code</p>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-umber dark:text-zinc-100 tracking-wider">{activeHub.inviteCode}</span>
              <button onClick={() => { navigator.clipboard.writeText(activeHub.inviteCode); toast.success("Invite code copied"); }} className="text-taupe dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"><Copy size={16}/></button>
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}?hub=${activeHub.inviteCode}`); toast.success("Invite link copied"); }} title="Copy invite link" className="text-taupe dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"><LinkIcon size={16}/></button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-8 border-taupe/20 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <CardContent className="p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-umber dark:text-zinc-100"><Users size={19} /> Members</h3>
              <p className="mt-1 text-xs text-taupe dark:text-zinc-500">{members.length} {members.length === 1 ? 'person has' : 'people have'} access to this hub.</p>
            </div>
            {activeHub.role === 'Admin' && (
              <div className="flex items-center gap-3 rounded-xl border border-taupe/15 bg-sand/15 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/60">
                <div className="text-right">
                  <p className="text-xs font-bold text-umber dark:text-zinc-100">Member uploads</p>
                  <p className="text-[10px] text-taupe dark:text-zinc-500">{activeHub.allowMemberUploads === false ? 'Admins only' : 'Members allowed'}</p>
                </div>
                <Switch aria-label="Allow members to upload decks" disabled={isUpdatingPermission} checked={activeHub.allowMemberUploads !== false} onCheckedChange={handleUploadPermissionChange} className="data-[state=checked]:bg-emerald-500" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            {members.map(member => {
              const isOwner = member.userId === activeHub.ownerId;
              const isCurrentUser = member.userId === userId;
              const canManage = activeHub.role === 'Admin' && !isOwner && !isCurrentUser;
              return (
                <div key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-taupe/15 bg-sand/15 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-umber text-xs font-bold text-sand dark:bg-zinc-100 dark:text-zinc-950">{member.displayName.slice(0, 2).toUpperCase()}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-umber dark:text-zinc-100">{member.displayName}{isCurrentUser ? ' (You)' : ''}</p>
                      <p className="text-xs text-taupe dark:text-zinc-500">{isOwner ? 'Owner' : member.role}</p>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex shrink-0 items-center gap-1">
                      <Button size="sm" variant="ghost" disabled={memberActionId === member.id} onClick={() => handleMemberAction(member, member.role === 'Admin' ? 'Member' : 'Admin')} className="h-8 px-2 text-xs font-bold text-taupe hover:text-umber dark:text-zinc-400 dark:hover:text-zinc-100">
                        {member.role === 'Admin' ? 'Demote' : 'Promote'}
                      </Button>
                      <Button size="sm" variant="ghost" disabled={memberActionId === member.id} onClick={() => setPendingRemoval(member)} className="h-8 px-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30" title={`Remove ${member.displayName}`}><Trash2 size={14} /></Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-umber dark:text-zinc-100">Shared Materials</h3>
          {!canUploadToHub && <p className="mt-1 text-xs text-taupe dark:text-zinc-500">Only admins can add decks to this hub.</p>}
        </div>
        <Button onClick={() => setShowUploadModal(true)} disabled={!canUploadToHub} title={!canUploadToHub ? 'Only admins can upload to this hub' : 'Share a deck'} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 font-medium rounded-lg h-10 px-4 shadow-sm text-sm disabled:cursor-not-allowed disabled:opacity-50">
          <UploadCloud size={16} className="mr-2" /> {canUploadToHub ? 'Upload to Hub' : 'Admin Uploads Only'}
        </Button>
      </div>

      {sharedDecks.length === 0 ? (
        <Card className="border-2 border-dashed border-taupe/30 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 p-10 text-center flex flex-col items-center justify-center rounded-2xl">
          <div className="w-16 h-16 bg-greige/30 dark:bg-zinc-800 text-umber dark:text-zinc-400 rounded-full flex items-center justify-center mb-4"><Library size={32} /></div>
          <CardTitle className="text-xl text-umber dark:text-zinc-100 mb-2">No decks shared yet</CardTitle>
          <CardDescription className="text-taupe dark:text-zinc-400 mb-6 max-w-md mx-auto">Be the first to upload study material to this classroom.</CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sharedDecks.map(deck => (
            <Card key={deck.id} onClick={() => { setActiveDeck(deck); navigateTo('deck-details'); }} className="cursor-pointer bg-white dark:bg-zinc-900 border-taupe/20 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center"><BookOpen size={20} /></div>
                  <Badge variant="secondary" className="bg-sand dark:bg-zinc-800 text-umber dark:text-zinc-300 border-none">{deck.cards?.length || 0} cards</Badge>
                </div>
                <h4 className="font-bold text-lg text-umber dark:text-zinc-100 truncate">{deck.title}</h4>
                <p className="text-xs text-taupe dark:text-zinc-500 mt-1">Open deck to study shared material</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="rounded-2xl p-6 md:p-8 max-w-md w-full shadow-md relative animate-in zoom-in-95 duration-200 bg-white dark:bg-zinc-900 border-taupe/20 dark:border-zinc-800">
            <button onClick={() => setShowUploadModal(false)} className="absolute top-6 right-6 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100"><X size={20} /></button>
            <h3 className="text-xl font-bold text-umber dark:text-zinc-100 mb-2">Share Deck to Hub</h3>
            <p className="text-taupe dark:text-zinc-400 text-sm mb-6">Choose how you want to add study material to {activeHub.name}.</p>
            <div className="space-y-4">
              <div className="w-full p-4 border border-taupe/30 dark:border-zinc-800 rounded-xl text-left flex flex-col gap-3">
                <div className="w-10 h-10 bg-greige/20 dark:bg-zinc-950 rounded-lg flex items-center justify-center group-hover:bg-white dark:group-hover:bg-zinc-900 transition-colors"><Library size={20} className="text-umber dark:text-zinc-300"/></div>
                <div><p className="font-bold text-umber dark:text-zinc-100 text-sm">Select Existing Deck</p><p className="text-xs text-taupe dark:text-zinc-500 mt-0.5">Pick from your personal library</p></div>
                <select value={selectedDeckId} onChange={(event) => setSelectedDeckId(event.target.value)} className="h-10 rounded-lg border border-taupe/30 bg-white px-3 text-sm text-umber dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100">
                  <option value="">Choose a deck...</option>
                  {myDecks.filter(deck => !sharedDecks.some(sharedDeck => sharedDeck.id === deck.id)).map(deck => <option key={deck.id} value={deck.id}>{deck.title}</option>)}
                </select>
                <Button onClick={handleShareExistingDeck} disabled={!selectedDeckId} className="h-10 rounded-lg bg-umber text-sand dark:bg-zinc-100 dark:text-zinc-950">Share selected deck</Button>
              </div>
              <div className="w-full p-4 border border-amber-600/30 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl text-left flex items-center gap-4 group">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/80 rounded-lg flex items-center justify-center transition-colors"><UploadCloud size={20} className="text-amber-600 dark:text-amber-500"/></div>
                <div className="flex-1"><p className="font-bold text-amber-800 dark:text-amber-400 text-sm">Generate from File</p><p className="text-xs text-amber-700/70 dark:text-amber-500/70 mt-0.5">Upload PDF/PPTX to auto-build</p></div>
                <input ref={fileInputRef} type="file" accept=".pdf,.pptx,.txt" onChange={handleGenerateAndShare} className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} disabled={isAddingDeck} variant="outline" className="h-10 rounded-lg border-amber-600/40 text-amber-800 dark:border-amber-700 dark:text-amber-400">{isAddingDeck ? 'Generating...' : 'Choose file'}</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {pendingRemoval && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="remove-member-title">
          <Card className="w-full max-w-md rounded-2xl border-taupe/20 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"><Trash2 size={20} /></div>
            <h3 id="remove-member-title" className="text-lg font-bold text-umber dark:text-zinc-100">Remove {pendingRemoval.displayName}?</h3>
            <p className="mt-2 text-sm leading-relaxed text-taupe dark:text-zinc-400">They will lose access to this hub and its shared materials. You can invite them again later with the hub code.</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPendingRemoval(null)} className="rounded-lg text-taupe dark:text-zinc-400">Cancel</Button>
              <Button onClick={() => handleMemberAction(pendingRemoval, 'remove')} disabled={memberActionId === pendingRemoval.id} className="rounded-lg bg-rose-600 text-white hover:bg-rose-700">{memberActionId === pendingRemoval.id ? 'Removing...' : 'Remove member'}</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
