import { useState, useEffect } from 'react';
import { 
  User, Mail, Lock, Sparkles, ArrowRight, ArrowLeft, 
  CheckCircle, ShieldCheck, Laptop, Smartphone, Eye, EyeOff, RotateCw, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';

export const PRESET_AVATARS = [
  // Female Avatars
  { id: 'avatar-f-1', label: 'Luna', style: 'Waves', category: 'female', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Luna&hair=variant48&beardProbability=0&backgroundColor=fce8d5' },
  { id: 'avatar-f-2', label: 'Chloe', style: 'Long Hair', category: 'female', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Chloe&hair=variant14&beardProbability=0&backgroundColor=fef3c7' },
  { id: 'avatar-f-3', label: 'Sara', style: 'Side Part', category: 'female', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sara&hair=variant08&beardProbability=0&backgroundColor=dcfce7' },
  { id: 'avatar-f-4', label: 'Elena', style: 'Top Bun', category: 'female', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Elena&hair=variant20&beardProbability=0&backgroundColor=ede9fe' },
  { id: 'avatar-f-5', label: 'Amira', style: 'Chic Bob', category: 'female', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Amira&hair=variant62&beardProbability=0&backgroundColor=ffe4e6' },
  { id: 'avatar-f-6', label: 'Aria', style: 'Braids', category: 'female', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Aria&hair=variant61&beardProbability=0&backgroundColor=e0f2fe' },
  { id: 'avatar-f-7', label: 'Maya', style: 'Curly', category: 'female', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Maya&hair=variant46&beardProbability=0&backgroundColor=fce8d5' },
  { id: 'avatar-f-8', label: 'Sophia', style: 'Ponytail', category: 'female', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sophia&hair=variant63&beardProbability=0&backgroundColor=fef3c7' },

  // Male / Neutral Avatars
  { id: 'avatar-m-1', label: 'Felix', style: 'Scholar', category: 'male', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e5ddd3' },
  { id: 'avatar-m-2', label: 'Milo', style: 'Tech Pro', category: 'male', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Milo&backgroundColor=e0f2fe' },
  { id: 'avatar-m-3', label: 'Leo', style: 'Scientist', category: 'male', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Leo&backgroundColor=dcfce7' },
  { id: 'avatar-m-4', label: 'Oliver', style: 'Creative', category: 'male', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Oliver&backgroundColor=fef3c7' },
  { id: 'avatar-m-5', label: 'Noah', style: 'Explorer', category: 'male', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Noah&backgroundColor=ede9fe' },
  { id: 'avatar-m-6', label: 'Ethan', style: 'Thinker', category: 'male', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Ethan&backgroundColor=fce8d5' },
];

export function AuthModal({ 
  isOpen, 
  onClose, 
  userId, 
  onAuthSuccess, 
  initialMode = 'prompt',
  canDismiss = false 
}) {
  const [mode, setMode] = useState(initialMode); // 'prompt' | 'register' | 'guest' | 'login'

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'prompt');
    }
  }, [isOpen, initialMode]);
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('cramzero-display-name') || 'Student');
  const [selectedAvatar, setSelectedAvatar] = useState(() => localStorage.getItem('cramzero-avatar-url') || PRESET_AVATARS[0].url);
  const [avatarCategory, setAvatarCategory] = useState('all'); // 'all' | 'female' | 'male'
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showCustomAvatar, setShowCustomAvatar] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const currentAvatar = showCustomAvatar && customAvatarUrl.trim() ? customAvatarUrl.trim() : selectedAvatar;

  const filteredAvatars = avatarCategory === 'all' 
    ? PRESET_AVATARS 
    : PRESET_AVATARS.filter((av) => av.category === avatarCategory);

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Please enter a display name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          display_name: displayName.trim(),
          avatar_url: currentAvatar,
          guest_user_id: userId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create account');
      }

      toast.success('Account created successfully!', {
        description: `Welcome to CramZero, ${data.display_name}! Your decks will sync on any device.`,
      });

      onAuthSuccess({
        id: data.id,
        email: data.email,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        isGuest: false,
      });
    } catch (err) {
      toast.error('Registration failed', { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle guest setup
  const handleGuestSetup = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Please enter a display name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          avatar_url: currentAvatar,
          user_id: userId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to initialize profile');
      }

      toast.success('Profile initialized', {
        description: `Studying as ${data.display_name}. You can create a cloud account anytime in Profile!`,
      });

      onAuthSuccess({
        id: data.id,
        email: null,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        isGuest: true,
      });
    } catch (err) {
      toast.error('Could not set up guest identity', { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle log in
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          guest_user_id: userId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Invalid email or password');
      }

      toast.success('Signed in successfully!', {
        description: `Welcome back, ${data.display_name}! Your decks are synced.`,
      });

      onAuthSuccess({
        id: data.id,
        email: data.email,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        isGuest: false,
      });
    } catch (err) {
      toast.error('Sign in failed', { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 dark:bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
        
        {/* Close / Dismiss Button (Always accessible so users never get trapped) */}
        <button 
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors z-20"
        >
          <X size={18} />
        </button>

        {/* STEP 1: INITIAL PROMPT (Create Account vs Skip/Guest) */}
        {mode === 'prompt' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Landing
              </button>
              <span className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">Get Started</span>
              <div className="w-8"></div>
            </div>

            <div className="text-center space-y-3 pt-1">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 p-2.5 mx-auto flex items-center justify-center shadow-xs">
                <img src="/cramzero-logo.svg" alt="CramZero Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-2xl font-black text-stone-900 dark:text-zinc-100 tracking-tight">
                Welcome to CramZero
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Study with smart flashcards, AI mock exams, and collaborative hubs. How would you like to get started?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {/* Option 1: Create Full Account */}
              <Card 
                onClick={() => setMode('register')}
                className="group p-5 rounded-2xl border-2 border-amber-500/40 hover:border-amber-500 dark:border-amber-500/30 dark:hover:border-amber-400 bg-gradient-to-br from-amber-500/5 via-white to-transparent dark:from-amber-950/20 dark:via-zinc-900 dark:to-transparent cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-zinc-100">
                        Create Free Account
                      </h3>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      Access all your flashcards across phones, laptops, and tablets using email & password.
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-[11px] font-semibold text-stone-600 dark:text-zinc-300">
                      <span className="flex items-center gap-1"><Smartphone size={13} className="text-amber-600" /> Phone</span>
                      <span className="text-stone-300 dark:text-zinc-700">•</span>
                      <span className="flex items-center gap-1"><Laptop size={13} className="text-amber-600" /> Laptop</span>
                      <span className="text-stone-300 dark:text-zinc-700">•</span>
                      <span className="text-amber-600 font-bold ml-auto flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        Set Up <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Option 2: Skip for Now (Guest) */}
              <Card 
                onClick={() => setMode('guest')}
                className="group p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 hover:border-stone-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-zinc-100">
                      Skip for Now (Continue as Guest)
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      Jump right in without a password. Your decks stay saved on this device, and you can create an account anytime.
                    </p>
                    <div className="flex items-center justify-between mt-3 text-[11px] font-semibold text-stone-400 dark:text-zinc-500">
                      <span>Quick Identity Setup</span>
                      <span className="text-stone-700 dark:text-zinc-300 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        Skip & Choose Avatar <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Existing User Sign In Link */}
            <div className="pt-2 text-center border-t border-stone-100 dark:border-zinc-800 flex items-center justify-center gap-1.5 text-xs text-stone-500 dark:text-zinc-400">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* STEP 2A: REGISTER FORM (Display Name, Avatar, Email, Password) */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-3">
              <button 
                type="button" 
                onClick={() => setMode('prompt')}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <h3 className="font-bold text-sm text-stone-900 dark:text-zinc-100">Create Account</h3>
              <div className="w-10"></div>
            </div>

            {/* Avatar Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                  Choose Your Avatar / PFP
                </label>
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-stone-200/60 dark:border-zinc-700/60">
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('all')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                      avatarCategory === 'all'
                        ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400'
                    }`}
                  >
                    All ({PRESET_AVATARS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('female')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                      avatarCategory === 'female'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400'
                    }`}
                  >
                    Female (8)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('male')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                      avatarCategory === 'male'
                        ? 'bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400'
                    }`}
                  >
                    Male (6)
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img 
                    src={currentAvatar} 
                    alt="Profile Preview" 
                    className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-zinc-800 border-2 border-amber-500/50 shadow-sm object-cover" 
                  />
                </div>
                <div className="flex-1 grid grid-cols-4 sm:grid-cols-7 gap-1.5 max-h-28 overflow-y-auto p-1.5 rounded-xl bg-stone-50/80 dark:bg-zinc-800/40 border border-stone-200/60 dark:border-zinc-800">
                  {filteredAvatars.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      title={`${av.label} (${av.style})`}
                      onClick={() => { setSelectedAvatar(av.url); setShowCustomAvatar(false); }}
                      className={`aspect-square rounded-xl p-0.5 border-2 transition-all hover:scale-105 overflow-hidden flex items-center justify-center ${
                        selectedAvatar === av.url && !showCustomAvatar 
                          ? 'border-amber-500 shadow-sm scale-105 ring-2 ring-amber-500/20 bg-amber-50 dark:bg-amber-950/30' 
                          : 'border-transparent opacity-75 hover:opacity-100 hover:border-stone-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-full rounded-lg object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Display Name Input */}
            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Display Name (Identity in Hubs & Decks) *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <Input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Cruz or TechStudent"
                  className="pl-10 h-11 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Email Address (Cross-device login) *
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@university.edu"
                  className="pl-10 h-11 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Password (Min. 6 chars) *
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition-all"
            >
              {isLoading ? <RotateCw size={16} className="animate-spin mr-2" /> : <ShieldCheck size={16} className="mr-2" />}
              {isLoading ? 'Creating Account...' : 'Create Account & Enter'}
            </Button>

            <div className="pt-1 text-center flex items-center justify-center gap-1.5 text-xs text-stone-500 dark:text-zinc-400">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* STEP 2B: GUEST SETUP FORM (Display Name & Avatar) */}
        {mode === 'guest' && (
          <form onSubmit={handleGuestSetup} className="space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-3">
              <button 
                type="button" 
                onClick={() => setMode('prompt')}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <h3 className="font-bold text-sm text-stone-900 dark:text-zinc-100">Guest Identity Setup</h3>
              <div className="w-10"></div>
            </div>

            <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
              This avatar and display name represent you when collaborating in Study Hubs, playing Multiplayer trivia, and sharing decks.
            </p>

            {/* Avatar Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                  Pick Your Avatar
                </label>
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-stone-200/60 dark:border-zinc-700/60">
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('all')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                      avatarCategory === 'all'
                        ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400'
                    }`}
                  >
                    All ({PRESET_AVATARS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('female')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                      avatarCategory === 'female'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400'
                    }`}
                  >
                    Female (8)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarCategory('male')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                      avatarCategory === 'male'
                        ? 'bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400'
                    }`}
                  >
                    Male (6)
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img 
                    src={currentAvatar} 
                    alt="Profile Preview" 
                    className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-zinc-800 border-2 border-amber-500/50 shadow-sm object-cover" 
                  />
                </div>
                <div className="flex-1 grid grid-cols-4 sm:grid-cols-7 gap-1.5 max-h-28 overflow-y-auto p-1.5 rounded-xl bg-stone-50/80 dark:bg-zinc-800/40 border border-stone-200/60 dark:border-zinc-800">
                  {filteredAvatars.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      title={`${av.label} (${av.style})`}
                      onClick={() => { setSelectedAvatar(av.url); setShowCustomAvatar(false); }}
                      className={`aspect-square rounded-xl p-0.5 border-2 transition-all hover:scale-105 overflow-hidden flex items-center justify-center ${
                        selectedAvatar === av.url && !showCustomAvatar 
                          ? 'border-amber-500 shadow-sm scale-105 ring-2 ring-amber-500/20 bg-amber-50 dark:bg-amber-950/30' 
                          : 'border-transparent opacity-75 hover:opacity-100 hover:border-stone-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-full rounded-lg object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Display Name Input */}
            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Display Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <Input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex or NurseStudent"
                  className="pl-10 h-11 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-zinc-800/60 border border-stone-200/80 dark:border-zinc-800 text-xs text-stone-600 dark:text-zinc-300">
              💡 You can add an email and password anytime from your Profile page to sync across other devices.
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm shadow-sm transition-all"
            >
              {isLoading ? <RotateCw size={16} className="animate-spin mr-2" /> : <CheckCircle size={16} className="mr-2" />}
              {isLoading ? 'Saving Identity...' : 'Save Identity & Start Studying'}
            </Button>

            <div className="pt-1 text-center flex items-center justify-center gap-1.5 text-xs text-stone-500 dark:text-zinc-400">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* STEP 2C: SIGN IN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-3">
              <button 
                type="button" 
                onClick={() => setMode('prompt')}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <h3 className="font-bold text-sm text-stone-900 dark:text-zinc-100">Sign In</h3>
              <div className="w-10"></div>
            </div>

            <div className="text-center space-y-2 mb-1">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 p-2 mx-auto flex items-center justify-center shadow-xs">
                <img src="/cramzero-logo.svg" alt="CramZero Logo" className="w-full h-full object-contain" />
              </div>
              <h3 className="font-extrabold text-lg text-stone-900 dark:text-zinc-100">Welcome Back</h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Sign in with your email and password to sync your decks and hubs to this device.
              </p>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@university.edu"
                  className="pl-10 h-11 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition-all"
            >
              {isLoading ? <RotateCw size={16} className="animate-spin mr-2" /> : <ShieldCheck size={16} className="mr-2" />}
              {isLoading ? 'Signing In...' : 'Sign In & Sync Decks'}
            </Button>

            <div className="text-center pt-2 space-y-2">
              <button 
                type="button"
                onClick={() => setMode('register')}
                className="text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 block mx-auto"
              >
                Don't have an account yet? <span className="font-bold underline">Create Free Account</span>
              </button>
              <button 
                type="button"
                onClick={() => setMode('guest')}
                className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-zinc-300 block mx-auto"
              >
                Or continue as <span className="underline">Guest</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

