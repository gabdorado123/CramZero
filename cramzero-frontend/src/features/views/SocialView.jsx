import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Search, UserPlus, UserCheck, Users, GraduationCap, Trophy, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';
import { UniversityLogo } from '@/components/education/UniversitySelector';

export function SocialView({ navigateTo, userId, setActiveDeck }) {
  const [query, setQuery] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('people');
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [universityQuery, setUniversityQuery] = useState('');
  const [isUniversityLoading, setIsUniversityLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== 'universities') return undefined;
    const timer = setTimeout(async () => {
      setIsUniversityLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/universities?query=${encodeURIComponent(universityQuery)}`);
        if (!response.ok) throw new Error('Could not load university communities.');
        setUniversities(await response.json());
      } catch (error) {
        toast.error('Could not load universities', { description: error.message });
      } finally {
        setIsUniversityLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [activeTab, universityQuery]);

  const openUniversity = async (name) => {
    setIsUniversityLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/universities/${encodeURIComponent(name)}?viewer_id=${encodeURIComponent(userId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not open university.');
      setSelectedUniversity(data);
    } catch (error) {
      toast.error('Could not open university', { description: error.message });
    } finally {
      setIsUniversityLoading(false);
    }
  };

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setProfiles([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/users/search?query=${encodeURIComponent(term)}&viewer_id=${encodeURIComponent(userId)}`);
        if (!response.ok) throw new Error('Could not search profiles.');
        setProfiles(await response.json());
      } catch (error) {
        toast.error('Profile search failed', { description: error.message });
      } finally {
        setIsLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, userId]);

  const openProfile = async (profile) => {
    try {
      const response = await fetch(`${API_BASE}/api/users/${profile.id}/profile?viewer_id=${encodeURIComponent(userId)}`);
      if (!response.ok) throw new Error('Could not load this profile.');
      setSelectedProfile(await response.json());
    } catch (error) {
      toast.error('Could not open profile', { description: error.message });
    }
  };

  const toggleFollow = async () => {
    if (!selectedProfile) return;
    const method = selectedProfile.is_following ? 'DELETE' : 'POST';
    try {
      const response = await fetch(`${API_BASE}/api/users/${selectedProfile.id}/follow`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.detail || 'Could not update follow status.');
      setSelectedProfile(updated);
      setProfiles(current => current.map(profile => profile.id === updated.id ? updated : profile));
    } catch (error) {
      toast.error('Could not update follow status', { description: error.message });
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 md:py-8">
      <div className="flex items-start gap-4 border-b border-stone-200/70 pb-5 dark:border-zinc-800">
        <Button variant="ghost" size="icon" onClick={() => navigateTo('dashboard')} className="rounded-full"><ArrowLeft size={18} /></Button>
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">Community</p><h2 className="mt-1 text-2xl font-black text-umber dark:text-zinc-100 sm:text-3xl">Find your study people</h2><p className="mt-1 text-sm text-taupe dark:text-zinc-400">Follow learners or join your university community.</p></div>
      </div>
      <div className="grid max-w-xl grid-cols-2 gap-1.5 rounded-2xl border border-stone-200/80 bg-stone-100/70 p-1.5 dark:border-zinc-800 dark:bg-zinc-900/80">
        <button type="button" onClick={() => { setActiveTab('people'); setSelectedUniversity(null); }} className={`rounded-xl px-4 py-2.5 text-sm font-bold ${activeTab === 'people' ? 'bg-white text-umber shadow-sm dark:bg-zinc-800 dark:text-zinc-100' : 'text-taupe'}`}><Users size={15} className="mr-2 inline" />People</button>
        <button type="button" onClick={() => { setActiveTab('universities'); setSelectedProfile(null); }} className={`rounded-xl px-4 py-2.5 text-sm font-bold ${activeTab === 'universities' ? 'bg-white text-umber shadow-sm dark:bg-zinc-800 dark:text-zinc-100' : 'text-taupe'}`}><GraduationCap size={15} className="mr-2 inline" />Universities</button>
      </div>
      {activeTab === 'universities' && !selectedUniversity && <div className="space-y-4">
        <div className="relative max-w-xl"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe" size={18} /><Input value={universityQuery} onChange={event => setUniversityQuery(event.target.value)} placeholder="Search university communities..." className="h-12 rounded-2xl bg-white pl-11 dark:bg-zinc-900" /></div>
        {isUniversityLoading && <p className="text-sm text-taupe">Loading campus communities...</p>}
        {!isUniversityLoading && universities.length === 0 && <Card className="rounded-3xl border-dashed"><CardContent className="p-10 text-center text-sm text-taupe">No university communities found. Add your university in your profile to start one.</CardContent></Card>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{universities.map(item => <Card key={item.name} onClick={() => openUniversity(item.name)} className="cursor-pointer rounded-3xl transition hover:-translate-y-1 hover:shadow-lg"><CardContent className="flex items-center gap-4 p-5"><UniversityLogo university={{ shortName: item.short_name, logoUrl: item.logo_url }} size="h-12 w-12" /><div className="min-w-0 flex-1"><h3 className="truncate font-bold text-umber dark:text-zinc-100">{item.name}</h3><p className="mt-1 text-xs text-taupe">{item.city} • {item.member_count} learners</p></div><ChevronRight size={17} className="text-stone-400" /></CardContent></Card>)}</div>
      </div>}
      {activeTab === 'universities' && selectedUniversity && <UniversityCommunity community={selectedUniversity} onBack={() => setSelectedUniversity(null)} setActiveDeck={setActiveDeck} navigateTo={navigateTo} />}
      {activeTab === 'people' && <>
      <div className="relative max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe" size={18} />
        <Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by display name..." className="h-12 rounded-2xl bg-white pl-11 dark:bg-zinc-900" />
      </div>
      {isLoading && <p className="text-sm text-taupe">Searching profiles...</p>}
      {!selectedProfile && query.trim().length >= 2 && !isLoading && profiles.length === 0 && <Card className="rounded-3xl border-dashed"><CardContent className="p-10 text-center text-sm text-taupe">No public profiles found yet.</CardContent></Card>}
      {!selectedProfile && profiles.length > 0 && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{profiles.map(profile => <ProfileCard key={profile.id} profile={profile} onOpen={() => openProfile(profile)} />)}</div>}
      {selectedProfile && (
        <div className="space-y-5">
          <Button variant="ghost" onClick={() => setSelectedProfile(null)} className="-ml-3 text-taupe"><ArrowLeft size={16} className="mr-2" /> Back to people</Button>
          <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg"><CardContent className="p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><img src={selectedProfile.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=Student'} alt="" className="h-20 w-20 rounded-3xl bg-white/20 object-cover" /><div className="min-w-0 flex-1"><h3 className="text-2xl font-black">{selectedProfile.display_name}</h3><p className="mt-1 max-w-xl text-sm text-violet-100">{selectedProfile.bio || 'Learning something new every day.'}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-violet-100"><span>{selectedProfile.follower_count} followers</span><span>•</span><span>{selectedProfile.following_count} following</span></div></div><Button onClick={toggleFollow} className="rounded-full bg-white text-violet-700 hover:bg-violet-50">{selectedProfile.is_following ? <><UserCheck size={16} className="mr-2" /> Following</> : <><UserPlus size={16} className="mr-2" /> Follow</>}</Button></div></CardContent></Card>
          <div><h3 className="mb-3 flex items-center gap-2 text-lg font-black text-umber dark:text-zinc-100"><BookOpen size={19} className="text-amber-500" /> Public decks</h3>{selectedProfile.decks.length === 0 ? <Card className="rounded-3xl border-dashed"><CardContent className="p-8 text-center text-sm text-taupe">{selectedProfile.profile_visibility === 'Private' ? 'This learner keeps their profile private.' : 'No public decks yet.'}</CardContent></Card> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{selectedProfile.decks.map(deck => <Card key={deck.id} onClick={() => { setActiveDeck(deck); navigateTo('deck-details'); }} className="cursor-pointer rounded-3xl transition hover:-translate-y-1 hover:shadow-lg"><CardContent className="p-5"><Badge className="mb-3 bg-amber-100 text-amber-800">{deck.cards?.length || 0} cards</Badge><h4 className="font-bold text-umber dark:text-zinc-100">{deck.title}</h4><p className="mt-1 line-clamp-2 text-xs text-taupe dark:text-zinc-400">{deck.description || 'A public study deck.'}</p></CardContent></Card>)}</div>}</div>
        </div>
      )}
      {!selectedProfile && !query && <Card className="rounded-3xl border-0 bg-gradient-to-r from-amber-50 to-violet-50 dark:from-amber-950/30 dark:to-violet-950/30"><CardContent className="flex items-center gap-4 p-6"><Users className="text-violet-600" size={28} /><p className="text-sm text-stone-700 dark:text-zinc-300">Search for a classmate or creator to see their public profile and decks.</p></CardContent></Card>}
      </>}
    </div>
  );
}

function UniversityCommunity({ community, onBack, setActiveDeck, navigateTo }) {
  return <div className="space-y-5">
    <Button variant="ghost" onClick={onBack} className="-ml-3 text-taupe"><ArrowLeft size={16} className="mr-2" /> Back to universities</Button>
    <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg"><CardContent className="p-6 sm:p-8"><div className="flex items-center gap-4"><UniversityLogo university={{ shortName: community.short_name, logoUrl: community.logo_url }} size="h-16 w-16" /><div><h3 className="text-2xl font-black">{community.name}</h3><p className="mt-1 text-sm text-orange-100">{community.city} • {community.member_count} learners • {community.deck_count} public decks</p></div></div></CardContent></Card>
    <div className="grid gap-5 lg:grid-cols-5">
      <Card className="rounded-3xl lg:col-span-2"><CardContent className="p-6"><h3 className="mb-4 flex items-center gap-2 font-black text-umber dark:text-zinc-100"><Trophy size={18} className="text-amber-500" /> Campus leaderboard</h3><div className="space-y-2">{community.leaderboard.map((member, index) => <div key={member.id} className="flex items-center gap-3 rounded-xl bg-stone-50 p-3 dark:bg-zinc-800/60"><span className="w-5 text-center text-xs font-black text-stone-400">{index + 1}</span><img src={member.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=Student'} alt="" className="h-8 w-8 rounded-xl object-cover" /><span className="min-w-0 flex-1 truncate text-sm font-bold text-stone-800 dark:text-zinc-200">{member.display_name}</span><span className="text-xs font-black text-amber-600">{member.score} pts</span></div>)}</div><p className="mt-4 text-[11px] leading-relaxed text-taupe">Points reward public decks and community connections. Study activity rankings can be added when session sync is enabled.</p></CardContent></Card>
      <Card className="rounded-3xl lg:col-span-3"><CardContent className="p-6"><h3 className="mb-4 flex items-center gap-2 font-black text-umber dark:text-zinc-100"><BookOpen size={18} className="text-violet-500" /> Shared campus decks</h3>{community.decks.length === 0 ? <p className="py-8 text-center text-sm text-taupe">No public decks yet. Be the first to share one!</p> : <div className="grid gap-3 sm:grid-cols-2">{community.decks.map(deck => <button type="button" key={deck.id} onClick={() => { setActiveDeck(deck); navigateTo('deck-details'); }} className="rounded-2xl border border-stone-200 p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md dark:border-zinc-800"><Badge className="mb-2 bg-amber-100 text-amber-800">{deck.cards?.length || 0} cards</Badge><p className="font-bold text-umber dark:text-zinc-100">{deck.title}</p><p className="mt-1 line-clamp-2 text-xs text-taupe dark:text-zinc-400">{deck.description || 'Campus study deck'}</p></button>)}</div>}</CardContent></Card>
    </div>
  </div>;
}

function ProfileCard({ profile, onOpen }) {
  return <Card onClick={onOpen} className="cursor-pointer rounded-3xl transition hover:-translate-y-1 hover:shadow-lg"><CardContent className="flex items-center gap-4 p-5"><img src={profile.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=Student'} alt="" className="h-14 w-14 rounded-2xl bg-amber-100 object-cover" /><div className="min-w-0 flex-1"><h3 className="truncate font-bold text-umber dark:text-zinc-100">{profile.display_name}</h3><p className="mt-1 text-xs text-taupe dark:text-zinc-400">{profile.follower_count} followers • {profile.decks?.length || 0} public decks</p></div>{profile.is_following ? <UserCheck size={18} className="text-emerald-500" /> : <UserPlus size={18} className="text-violet-500" />}</CardContent></Card>;
}
