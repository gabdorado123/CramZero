import { useState } from 'react';
import { 
  User, Mail, Lock, ShieldCheck, ArrowLeft, RotateCw, CheckCircle, 
  Smartphone, Laptop, Sparkles, BookOpen, Users, Layers, LogOut, Check,
  KeyRound
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';
import { PRESET_AVATARS } from '@/components/auth/AuthModal';

export function ProfileView({ 
  navigateTo, 
  userId, 
  displayName, 
  setDisplayName, 
  userEmail, 
  setUserEmail, 
  avatarUrl, 
  setAvatarUrl, 
  isGuest, 
  setIsGuest,
  myDecks, 
  myHubs,
  onOpenAuthModal,
  onSignOut
}) {
  const [nameInput, setNameInput] = useState(displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarUrl || PRESET_AVATARS[0].url);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Upgrade form state
  const [upgradeEmail, setUpgradeEmail] = useState('');
  const [upgradePassword, setUpgradePassword] = useState('');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const totalCards = myDecks.reduce((sum, d) => sum + (d.cards?.length || 0), 0);

  // Save profile updates (display name & avatar)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast.error('Please enter a display name');
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          display_name: nameInput.trim(),
          avatar_url: selectedAvatar,
        }),
      });

      const updated = await response.json();
      if (!response.ok) {
        throw new Error(updated.detail || 'Could not save profile');
      }

      setDisplayName(updated.display_name);
      setAvatarUrl(updated.avatar_url);
      localStorage.setItem('cramzero-display-name', updated.display_name);
      if (updated.avatar_url) {
        localStorage.setItem('cramzero-avatar-url', updated.avatar_url);
      }

      toast.success('Profile updated!', {
        description: 'Your new display name and avatar are active across all hubs and decks.',
      });
    } catch (err) {
      toast.error('Could not update profile', { description: err.message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Upgrade guest to full account
  const handleUpgradeAccount = async (e) => {
    e.preventDefault();
    if (!upgradeEmail.trim() || !upgradeEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (upgradePassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsUpgrading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          display_name: nameInput.trim() || displayName,
          avatar_url: selectedAvatar,
          email: upgradeEmail.trim().toLowerCase(),
          password: upgradePassword,
        }),
      });

      const updated = await response.json();
      if (!response.ok) {
        throw new Error(updated.detail || 'Could not upgrade account');
      }

      setUserEmail(updated.email);
      setIsGuest(false);
      localStorage.setItem('cramzero-user-email', updated.email);
      localStorage.setItem('cramzero-is-guest', 'false');

      toast.success('Account upgraded to Full Cloud Account!', {
        description: `You can now log in on any device using ${updated.email}. All your decks are safe!`,
      });
    } catch (err) {
      toast.error('Upgrade failed', { description: err.message });
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-stone-200/60 dark:border-zinc-800/80">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigateTo('dashboard')} 
            className="-ml-3 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 font-semibold mb-1"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Workspace
          </Button>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-umber dark:text-zinc-100 tracking-tight">
            Account & Profile
          </h2>
          <p className="text-xs sm:text-sm text-taupe dark:text-zinc-400 mt-0.5">
            Manage your student identity, cross-device cloud sync, and deck preferences.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={onSignOut}
            className="rounded-xl border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold text-xs h-10 px-4 w-full sm:w-auto"
          >
            <LogOut size={15} className="mr-2" /> Switch Account / Log Out
          </Button>
        </div>
      </div>

      {/* Hero Profile Overview Card */}
      <Card className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-amber-50/20 to-stone-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-stone-200/90 dark:border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group shrink-0">
            <img 
              src={selectedAvatar || PRESET_AVATARS[0].url} 
              alt={displayName} 
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-amber-100/50 dark:bg-zinc-800 border-4 border-white dark:border-zinc-800 shadow-md object-cover"
            />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-white" title="Active">
              <Check size={12} strokeWidth={3} />
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-zinc-100">
                {displayName}
              </h3>
              {isGuest ? (
                <Badge className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-none rounded-full px-3 py-0.5 text-xs font-bold self-center sm:self-auto">
                  Guest Device Account
                </Badge>
              ) : (
                <Badge className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-none rounded-full px-3 py-0.5 text-xs font-bold self-center sm:self-auto flex items-center gap-1">
                  <ShieldCheck size={13} /> Cloud Synced
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 font-medium">
              {userEmail ? (
                <span className="flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail size={14} className="text-stone-400" /> {userEmail}
                </span>
              ) : (
                <span>Decks stored locally on this device. Create an account to access them anywhere.</span>
              )}
            </p>

            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start text-xs text-stone-500 dark:text-zinc-400 font-mono">
              <span className="bg-stone-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">ID: {userId.slice(0, 16)}...</span>
            </div>
          </div>
        </div>
      </Card>

      {/* UPGRADE PROMPT (Only for Guest Users) */}
      {isGuest && (
        <Card className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-zinc-900 dark:to-transparent border-2 border-amber-500/40 dark:border-amber-500/30 shadow-sm space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <KeyRound size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-zinc-100 tracking-tight">
                Upgrade to a Full Account (Free)
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-300 mt-1 leading-relaxed">
                Never lose your decks when clearing cookies or switching phones. Set your email and password below to convert this guest profile into a cloud-synced account.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpgradeAccount} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-2">
            <div className="sm:col-span-5 relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input
                type="email"
                required
                value={upgradeEmail}
                onChange={(e) => setUpgradeEmail(e.target.value)}
                placeholder="Enter email address"
                className="pl-10 h-11 rounded-xl text-sm bg-white dark:bg-zinc-950"
              />
            </div>
            <div className="sm:col-span-4 relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input
                type="password"
                required
                minLength={6}
                value={upgradePassword}
                onChange={(e) => setUpgradePassword(e.target.value)}
                placeholder="Choose password (min 6)"
                className="pl-10 h-11 rounded-xl text-sm bg-white dark:bg-zinc-950"
              />
            </div>
            <div className="sm:col-span-3">
              <Button
                type="submit"
                disabled={isUpgrading}
                className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                {isUpgrading ? <RotateCw size={15} className="animate-spin mr-1.5" /> : <ShieldCheck size={15} className="mr-1.5" />}
                {isUpgrading ? 'Upgrading...' : 'Upgrade Now'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Study Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Saved Decks', value: myDecks.length, icon: BookOpen, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
          { label: 'Flashcards Compiled', value: totalCards, icon: Layers, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
          { label: 'Study Hubs Active', value: myHubs.length, icon: Users, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
          { label: 'Sync Status', value: isGuest ? 'Local Only' : 'Cloud Active', icon: Smartphone, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
        ].map((stat, i) => (
          <Card key={i} className="p-5 rounded-2xl border border-stone-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-2xs">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <p className="text-xs font-semibold text-stone-500 dark:text-zinc-400">{stat.label}</p>
            </div>
            <p className="text-2xl font-black text-stone-900 dark:text-zinc-100 ml-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Edit Profile Form */}
      <Card className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
            Edit Student Identity
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
            Customize how your classmates and hub peers see you.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar Grid */}
          <div>
            <label className="block text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5">
              Choose Profile Picture (PFP)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {PRESET_AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.url)}
                  className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all hover:scale-105 ${
                    selectedAvatar === av.url 
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 shadow-xs' 
                      : 'border-stone-200 dark:border-zinc-800 hover:border-stone-400'
                  }`}
                >
                  <img src={av.url} alt={av.label} className="w-12 h-12 rounded-xl object-cover" />
                  <span className="text-[11px] font-semibold text-stone-700 dark:text-zinc-300">{av.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Display Name Input */}
          <div className="max-w-md">
            <label className="block text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Display Name *
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Alex Cruz"
                className="pl-10 h-11 rounded-xl text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSavingProfile}
            className="rounded-full bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-stone-800 font-bold px-6 h-11 shadow-xs"
          >
            {isSavingProfile ? <RotateCw size={16} className="animate-spin mr-2" /> : <CheckCircle size={16} className="mr-2" />}
            {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </form>
      </Card>

    </div>
  );
}

