import { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Users, UploadCloud, Plus, ArrowLeft, Trash2,
  CheckCircle, Copy, Link as LinkIcon, X, ShieldCheck,
  Search, Sparkles, FileText, Share2, Layers, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';

export function HubDetailsView({ navigateTo, activeHub, setActiveHub, setMyHubs, myDecks, setMyDecks, setActiveDeck, userId }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [isAddingDeck, setIsAddingDeck] = useState(false);
  const [memberActionId, setMemberActionId] = useState(null);
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [isUpdatingPermission, setIsUpdatingPermission] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
      <div className="max-w-4xl mx-auto my-auto p-12 text-center">
        <Card className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-2">Study Hub Not Found</h2>
          <p className="text-stone-500 dark:text-zinc-400 mb-6 text-sm">The selected hub could not be loaded or is no longer available.</p>
          <Button onClick={() => navigateTo('hubs')} className="bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full h-11 px-6">
            <ArrowLeft size={16} className="mr-2" /> Return to Hubs
          </Button>
        </Card>
      </div>
    );
  }

  const sharedDecks = activeHub.sharedDecks || [];
  const members = activeHub.memberList || [];
  const canUploadToHub = activeHub.role === 'Admin' || activeHub.allowMemberUploads !== false;

  const filteredDecks = sharedDecks.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigateTo('hubs')}
          className="-ml-3 text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 rounded-full font-medium"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Study Hubs
        </Button>
      </div>

      {/* Hero Header Card (Spacious, Full Desktop Width) */}
      <Card className="rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden bg-gradient-to-br from-white via-stone-50/40 to-amber-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-stone-200/90 dark:border-zinc-800">
        <div className="absolute top-0 right-0 p-8 text-stone-200/20 dark:text-zinc-800/20 pointer-events-none">
          <Users size={160} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge className="bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-bold text-[11px] rounded-full px-3 py-0.5">
                Role: {activeHub.role}
              </Badge>
              <span className="text-stone-300 dark:text-zinc-700">•</span>
              <span className="text-xs font-semibold text-stone-500 dark:text-zinc-400">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </span>
              <span className="text-stone-300 dark:text-zinc-700">•</span>
              <span className="text-xs font-semibold text-stone-500 dark:text-zinc-400">
                {sharedDecks.length} {sharedDecks.length === 1 ? 'shared deck' : 'shared decks'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 dark:text-zinc-100 tracking-tight">
              {activeHub.name}
            </h1>

            <p className="text-stone-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
              {activeHub.description || 'Collaborative study hub for sharing decks, quizzes, and group prep sessions.'}
            </p>
          </div>

          {/* Quick Invite Code Box */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-stone-200/90 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between sm:justify-center gap-4 shadow-xs">
              <div className="text-left sm:text-center">
                <p className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Invite Code</p>
                <span className="font-mono font-black text-xl text-stone-900 dark:text-zinc-100 tracking-wider">
                  {activeHub.inviteCode}
                </span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-stone-200 dark:border-zinc-800 pl-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(activeHub.inviteCode);
                    toast.success("Invite code copied to clipboard");
                  }}
                  title="Copy invite code"
                  className="h-9 w-9 p-0 rounded-xl text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800"
                >
                  <Copy size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}?hub=${activeHub.inviteCode}`);
                    toast.success("Invite link copied to clipboard");
                  }}
                  title="Copy invite link"
                  className="h-9 w-9 p-0 rounded-xl text-stone-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-zinc-800"
                >
                  <LinkIcon size={16} />
                </Button>
              </div>
            </div>

            <Button
              onClick={() => setShowUploadModal(true)}
              disabled={!canUploadToHub}
              title={!canUploadToHub ? 'Only admins can upload to this hub' : 'Share a deck'}
              className="h-11 px-5 rounded-xl font-bold text-sm bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-stone-800 dark:hover:bg-zinc-200 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <UploadCloud size={17} />
              {canUploadToHub ? 'Upload to Hub' : 'Admin Uploads Only'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 2-Column Responsive Layout for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Main Left Column: Shared Materials (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                <BookOpen size={22} className="text-amber-500" />
                Shared Materials
                <Badge variant="secondary" className="ml-1 text-xs font-bold rounded-full">
                  {sharedDecks.length}
                </Badge>
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-0.5">
                Decks contributed for collective study and mock testing.
              </p>
            </div>

            {sharedDecks.length > 2 && (
              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-full text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            )}
          </div>

          {/* Shared Decks Grid */}
          {sharedDecks.length === 0 ? (
            <Card className="border-2 border-dashed border-stone-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-10 md:p-14 text-center flex flex-col items-center justify-center rounded-3xl">
              <div className="w-16 h-16 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-4">
                <Library size={32} />
              </div>
              <CardTitle className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-2">
                No materials shared yet
              </CardTitle>
              <CardDescription className="text-stone-500 dark:text-zinc-400 mb-6 max-w-md mx-auto text-sm">
                Share a flashcard deck from your personal library or upload lecture slides to generate a collaborative study set.
              </CardDescription>
              {canUploadToHub && (
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="rounded-full bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold px-6 h-11 shadow-sm"
                >
                  <Plus size={16} className="mr-2" /> Share First Deck
                </Button>
              )}
            </Card>
          ) : filteredDecks.length === 0 ? (
            <Card className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800">
              <p className="text-stone-500 dark:text-zinc-400 text-sm">No decks match "{searchQuery}".</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDecks.map(deck => (
                <Card
                  key={deck.id}
                  onClick={() => { setActiveDeck(deck); navigateTo('deck-details'); }}
                  className="cursor-pointer bg-white/95 dark:bg-zinc-900/95 border border-stone-200/90 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all rounded-3xl p-5 sm:p-6 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <BookOpen size={20} />
                      </div>
                      <Badge variant="secondary" className="bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border-none font-bold text-xs rounded-full px-2.5 py-0.5">
                        {deck.cards?.length || 0} cards
                      </Badge>
                    </div>

                    <h3 className="font-bold text-lg text-stone-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
                      {deck.title}
                    </h3>

                    <p className="text-xs text-stone-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {deck.description || 'Open this deck to start study sessions, practice quizzes, or vocal reviews.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                    <span>Study Deck →</span>
                    <span className="text-[11px] font-medium text-stone-400 dark:text-zinc-500">Tap to review</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Right Column: Members & Hub Controls (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Admin Upload Permission Card */}
          {activeHub.role === 'Admin' && (
            <Card className="rounded-3xl border border-stone-200/90 bg-white/95 p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/95">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">Member Uploads</h3>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
                    {activeHub.allowMemberUploads === false
                      ? 'Restricted to administrators only'
                      : 'All members can contribute study decks'}
                  </p>
                </div>
                <Switch
                  aria-label="Allow members to upload decks"
                  disabled={isUpdatingPermission}
                  checked={activeHub.allowMemberUploads !== false}
                  onCheckedChange={handleUploadPermissionChange}
                  className="data-[state=checked]:bg-emerald-500 shrink-0"
                />
              </div>
            </Card>
          )}

          {/* Members Roster Card */}
          <Card className="rounded-3xl border border-stone-200/90 bg-white/95 p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/95">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-bold text-stone-900 dark:text-zinc-100">
                <Users size={18} className="text-amber-500" />
                Classroom Members
              </h3>
              <Badge variant="outline" className="text-xs font-bold rounded-full">
                {members.length}
              </Badge>
            </div>

            <p className="text-xs text-stone-500 dark:text-zinc-400 mb-4">
              Students and educators connected to this study room.
            </p>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {members.map(member => {
                const isOwner = member.userId === activeHub.ownerId;
                const isCurrentUser = member.userId === userId;
                const canManage = activeHub.role === 'Admin' && !isOwner && !isCurrentUser;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200/70 bg-stone-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-950/60"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs">
                        {member.displayName ? member.displayName.slice(0, 2).toUpperCase() : 'ME'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-stone-900 dark:text-zinc-100">
                          {member.displayName}
                          {isCurrentUser && <span className="ml-1 text-xs font-semibold text-amber-600 dark:text-amber-400">(You)</span>}
                        </p>
                        <p className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500">
                          {isOwner ? '👑 Owner' : member.role}
                        </p>
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={memberActionId === member.id}
                          onClick={() => handleMemberAction(member, member.role === 'Admin' ? 'Member' : 'Admin')}
                          className="h-8 px-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg"
                        >
                          {member.role === 'Admin' ? 'Demote' : 'Promote'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={memberActionId === member.id}
                          onClick={() => setPendingRemoval(member)}
                          className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 rounded-lg"
                          title={`Remove ${member.displayName}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quick Hub Tip Card */}
          <Card className="rounded-3xl border border-amber-500/20 bg-amber-50/50 p-5 dark:border-amber-900/30 dark:bg-amber-950/20 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-1.5">
              <Sparkles size={14} /> Collaborative Study Tip
            </h4>
            <p className="text-xs text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
              Any deck added here is instantly accessible to everyone in this hub. You can also host live multiplayer study battles using any shared deck!
            </p>
          </Card>
        </div>
      </div>

      {/* SHARE / UPLOAD DECK MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100 p-1 rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-1">
              Add Material to Hub
            </h3>
            <p className="text-stone-500 dark:text-zinc-400 text-xs sm:text-sm mb-6">
              Choose an existing deck from your library or upload a document to auto-generate a new one.
            </p>

            <div className="space-y-4">
              {/* Option 1: Existing Library */}
              <div className="p-4 sm:p-5 border border-stone-200 dark:border-zinc-800 rounded-2xl bg-stone-50/50 dark:bg-zinc-950/50 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 dark:text-zinc-100 text-sm">Share from Your Library</p>
                    <p className="text-xs text-stone-500 dark:text-zinc-400">Select one of your saved decks</p>
                  </div>
                </div>

                <select
                  value={selectedDeckId}
                  onChange={(e) => setSelectedDeckId(e.target.value)}
                  className="h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">Choose a deck from your collection...</option>
                  {myDecks
                    .filter(deck => !sharedDecks.some(sharedDeck => sharedDeck.id === deck.id))
                    .map(deck => (
                      <option key={deck.id} value={deck.id}>
                        {deck.title} ({deck.cards?.length || 0} cards)
                      </option>
                    ))}
                </select>

                <Button
                  onClick={handleShareExistingDeck}
                  disabled={!selectedDeckId}
                  className="h-11 rounded-xl font-bold text-sm bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-stone-800 dark:hover:bg-zinc-200 disabled:opacity-40"
                >
                  Share Selected Deck
                </Button>
              </div>

              {/* Option 2: Upload File / Document */}
              <div className="p-4 sm:p-5 border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-800/40 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-amber-900 dark:text-amber-300 text-sm">Generate from Document</p>
                    <p className="text-xs text-amber-800/80 dark:text-amber-400/80">Upload PDF, PPTX, or TXT for AI parsing</p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.pptx,.txt"
                  onChange={handleGenerateAndShare}
                  className="hidden"
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAddingDeck}
                  variant="outline"
                  className="h-11 rounded-xl font-bold text-sm border-amber-500/40 text-amber-900 dark:border-amber-700 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-950/40"
                >
                  {isAddingDeck ? 'Processing & Generating...' : 'Choose File to Upload'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* REMOVE MEMBER CONFIRMATION MODAL */}
      {pendingRemoval && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <Card className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <Trash2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
              Remove {pendingRemoval.displayName}?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-zinc-400">
              They will lose immediate access to this study hub and its shared decks. They can rejoin if an admin provides them the invite code.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setPendingRemoval(null)}
                className="rounded-full text-stone-600 dark:text-zinc-400"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleMemberAction(pendingRemoval, 'remove')}
                disabled={memberActionId === pendingRemoval.id}
                className="rounded-full bg-rose-600 text-white hover:bg-rose-700 font-bold px-5"
              >
                {memberActionId === pendingRemoval.id ? 'Removing...' : 'Remove Member'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
