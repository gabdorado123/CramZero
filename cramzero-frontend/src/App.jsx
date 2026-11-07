import { useState, useEffect, useRef, lazy, Suspense } from 'react';
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

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Toaster, toast } from 'sonner';

// Chat UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Message, MessageAvatar, MessageContent, MessageFooter } from "@/components/ui/message";
import ReactMarkdown from 'react-markdown';
import { PrimaryNavigation } from '@/components/layout/PrimaryNavigation';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { UsageTracker } from '@/components/layout/UsageTracker';
import { WorkspaceSkeleton } from '@/components/layout/WorkspaceSkeleton';
import { LandingPageView } from '@/features/views/LandingPageView';
import { DashboardView } from '@/features/views/DashboardView';
import { AuthModal } from '@/components/auth/AuthModal';
import { EducationSetupModal } from '@/components/auth/EducationSetupModal';

// Code-split heavy secondary views for instantaneous initial boot and low memory footprint
const CodeSpaceView = lazy(() => import('@/features/codespace/CodeSpaceView').then(m => ({ default: m.CodeSpaceView })));
const ProfileView = lazy(() => import('@/features/views/ProfileView').then(m => ({ default: m.ProfileView })));
const StudyView = lazy(() => import('@/features/views/StudyView').then(m => ({ default: m.StudyView })));
const DecksView = lazy(() => import('@/features/views/DecksView').then(m => ({ default: m.DecksView })));
const AnalyticsView = lazy(() => import('@/features/views/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const StudyHubsView = lazy(() => import('@/features/views/StudyHubsView').then(m => ({ default: m.StudyHubsView })));
const CreateHubView = lazy(() => import('@/features/views/CreateHubView').then(m => ({ default: m.CreateHubView })));
const HubDetailsView = lazy(() => import('@/features/views/HubDetailsView').then(m => ({ default: m.HubDetailsView })));
const NewDeckView = lazy(() => import('@/features/views/NewDeckView').then(m => ({ default: m.NewDeckView })));
const DeckDetailsView = lazy(() => import('@/features/views/DeckDetailsView').then(m => ({ default: m.DeckDetailsView })));
const FlashcardModeView = lazy(() => import('@/features/views/FlashcardModeView').then(m => ({ default: m.FlashcardModeView })));
const QuizSetupView = lazy(() => import('@/features/views/QuizSetupView').then(m => ({ default: m.QuizSetupView })));
const MockExamSetupView = lazy(() => import('@/features/views/MockExamSetupView').then(m => ({ default: m.MockExamSetupView })));
const MockExamActiveView = lazy(() => import('@/features/views/MockExamActiveView').then(m => ({ default: m.MockExamActiveView })));
const MultiplayerView = lazy(() => import('@/features/views/MultiplayerView').then(m => ({ default: m.MultiplayerView })));
const SocialView = lazy(() => import('@/features/views/SocialView').then(m => ({ default: m.SocialView })));
const NotificationsView = lazy(() => import('@/features/views/NotificationsView').then(m => ({ default: m.NotificationsView })));
import { getInAppNotifications, IN_APP_NOTIFICATIONS_UPDATED } from '@/lib/inAppNotifications';
import { OnboardingTour } from '@/components/OnboardingTour';
import { speakWithElevenLabs } from '@/lib/elevenlabs';
import { recordAnalyticsEvent } from '@/lib/analytics';
import { API_BASE } from '@/lib/api';
import { CoreState } from '@/components/ui/core-state';

// --- MOCK DATA FOR HUBS AND COMMUNITY ---
const communityDatabase = [
  { id: 'comm-1', title: 'Advanced Data Structures', createdAt: '3 weeks ago', visibility: 'Community', type: 'saved', author: 'CS_Guru99', cards: Array(45).fill({ term: 'Concept', definition: 'Community generated definition.' }) },
  { id: 'comm-2', title: 'NCLEX Pharmacology Master', createdAt: '1 month ago', visibility: 'Community', type: 'saved', author: 'NurseRatched', cards: Array(120).fill({ term: 'Medication', definition: 'Community generated definition.' }) },
  { id: 'comm-3', title: 'JLPT N1 Vocabulary', createdAt: '2 days ago', visibility: 'Community', type: 'saved', author: 'TokyoStudent', cards: Array(85).fill({ term: 'Kanji', definition: 'Community generated definition.' }) }
];

const mockHubs = [
  { id: 'hub-1', name: 'BSIT 3A Core Subjects', description: 'Information Technology Section 3A Shared Resources', role: 'Admin', members: 38, decks: 14, inviteCode: 'BSIT-3A-26' },
  { id: 'hub-2', name: 'Web Dev Portfolio Prep', description: 'Frontend, Backend, and Full-Stack interview prep.', role: 'Member', members: 12, decks: 5, inviteCode: 'WEB-DEV-99' }
];

function getSharedRoute(search = '') {
  const params = new URLSearchParams(search);
  if (params.get('room')) return { type: 'room', value: params.get('room') };
  if (params.get('hub')) return { type: 'hub', value: params.get('hub') };
  if (params.get('deck')) return { type: 'deck', value: params.get('deck') };
  return null;
}

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    const sharedRoute = typeof window !== 'undefined'
      ? getSharedRoute(window.location.search)
      : null;
    if (sharedRoute?.type === 'room') return 'multiplayer';
    if (sharedRoute?.type === 'hub') return 'hubs';
    if (sharedRoute?.type === 'deck') return 'deck-details';
    return 'landing';
  });
  
  // --- GLOBAL STATE ---
  const [isBooting, setIsBooting] = useState(true); 
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [userId, setUserId] = useState(() => {
    const savedId = localStorage.getItem('cramzero-user-id');
    if (savedId) return savedId;
    const nextId = crypto.randomUUID ? crypto.randomUUID() : `student-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('cramzero-user-id', nextId);
    return nextId;
  });
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('cramzero-display-name') || 'Student');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('cramzero-user-email') || '');
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('cramzero-avatar-url') || 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e5ddd3');
  const [userBio, setUserBio] = useState(() => localStorage.getItem('cramzero-user-bio') || '');
  const [educationLevel, setEducationLevel] = useState(() => localStorage.getItem('cramzero-education-level') || '');
  const [university, setUniversity] = useState(() => localStorage.getItem('cramzero-university') || '');
  const [isEducationProfileLoaded, setIsEducationProfileLoaded] = useState(false);
  const [isEducationSetupDismissed, setIsEducationSetupDismissed] = useState(false);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('cramzero-is-guest') !== 'false');
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const notificationBaselineRef = useRef(null);

  const [hasProfileSetup, setHasProfileSetup] = useState(() => {
    return localStorage.getItem('cramzero-has-profile-setup') === 'true' || !!localStorage.getItem('cramzero-user-email');
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('prompt');

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    const refreshNotifications = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const [serverResponse, localNotifications] = await Promise.all([
          fetch(`${API_BASE}/api/notifications?user_id=${encodeURIComponent(userId)}`),
          Promise.resolve(getInAppNotifications()),
        ]);
        if (!serverResponse.ok) return;
        const serverNotifications = await serverResponse.json();
        if (cancelled) return;
        const unreadServer = serverNotifications.filter(notification => !notification.is_read);
        const unreadLocal = localNotifications.filter(notification => !notification.is_read);
        setUnreadNotificationCount(unreadServer.length + unreadLocal.length);
        const currentIds = new Set(unreadServer.map(notification => String(notification.id)));
        if (notificationBaselineRef.current === null) {
          notificationBaselineRef.current = currentIds;
          return;
        }
        unreadServer
          .filter(notification => !notificationBaselineRef.current.has(String(notification.id)))
          .forEach(notification => {
            toast.info('New follower', {
              description: notification.message,
              duration: 4500,
            });
          });
        notificationBaselineRef.current = currentIds;
      } catch (error) {
        console.warn('Could not refresh notification status:', error);
      }
    };
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 30000);
    window.addEventListener(IN_APP_NOTIFICATIONS_UPDATED, refreshNotifications);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener(IN_APP_NOTIFICATIONS_UPDATED, refreshNotifications);
    };
  }, [userId]);

  const handleAuthClose = () => {
    setShowAuthModal(false);
    const isSetup = hasProfileSetup || localStorage.getItem('cramzero-has-profile-setup') === 'true' || !!localStorage.getItem('cramzero-user-email');
    if (!isSetup) {
      handleNavigate('landing');
    }
  };

  const handleAuthSuccess = (userData) => {
    if (userData.accessToken) {
      localStorage.setItem('cramzero-access-token', userData.accessToken);
    }
    if (userData.id) {
      setUserId(userData.id);
      localStorage.setItem('cramzero-user-id', userData.id);
    }
    if (userData.displayName) {
      setDisplayName(userData.displayName);
      localStorage.setItem('cramzero-display-name', userData.displayName);
    }
    if (userData.avatarUrl) {
      setAvatarUrl(userData.avatarUrl);
      localStorage.setItem('cramzero-avatar-url', userData.avatarUrl);
    }
    if (userData.bio !== undefined) {
      setUserBio(userData.bio || '');
      localStorage.setItem('cramzero-user-bio', userData.bio || '');
    }
    if (userData.educationLevel) {
      setEducationLevel(userData.educationLevel);
      localStorage.setItem('cramzero-education-level', userData.educationLevel);
    }
    if (userData.university) {
      setUniversity(userData.university);
      localStorage.setItem('cramzero-university', userData.university);
    }
    if (userData.email) {
      setUserEmail(userData.email);
      localStorage.setItem('cramzero-user-email', userData.email);
    } else {
      setUserEmail('');
      localStorage.removeItem('cramzero-user-email');
    }
    setIsGuest(!!userData.isGuest);
    localStorage.setItem('cramzero-is-guest', userData.isGuest ? 'true' : 'false');
    setHasProfileSetup(true);
    localStorage.setItem('cramzero-has-profile-setup', 'true');
    setShowAuthModal(false);

    // Immediately route to dashboard view
    if (!document.startViewTransition) {
      setCurrentView('dashboard');
    } else {
      document.startViewTransition(() => {
        flushSync(() => {
          setCurrentView('dashboard');
        });
      });
    }
  };

  useEffect(() => {
    if (!hasProfileSetup || !userId) {
      setIsEducationProfileLoaded(true);
      return;
    }

    let cancelled = false;
    const loadEducationProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me?user_id=${encodeURIComponent(userId)}`);
        if (!response.ok) throw new Error('Could not load your profile.');
        const profile = await response.json();
        if (cancelled) return;
        if (profile.access_token) {
          localStorage.setItem('cramzero-access-token', profile.access_token);
        }

        const serverLevel = profile.education_level || '';
        const serverUniversity = profile.university || '';
        setEducationLevel(serverLevel);
        setUniversity(serverUniversity);
        if (serverLevel) localStorage.setItem('cramzero-education-level', serverLevel);
        else localStorage.removeItem('cramzero-education-level');
        if (serverUniversity) localStorage.setItem('cramzero-university', serverUniversity);
        else localStorage.removeItem('cramzero-university');

        const dismissedKey = `cramzero-education-skipped-${userId}`;
        setIsEducationSetupDismissed(localStorage.getItem(dismissedKey) === 'true');
      } catch (error) {
        console.warn('Could not refresh education profile:', error);
        if (!cancelled) {
          setIsEducationSetupDismissed(false);
        }
      } finally {
        if (!cancelled) setIsEducationProfileLoaded(true);
      }
    };

    setIsEducationProfileLoaded(false);
    loadEducationProfile();
    return () => {
      cancelled = true;
    };
  }, [hasProfileSetup, userId]);

  const handleSignOut = () => {
    const nextId = crypto.randomUUID ? crypto.randomUUID() : `student-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setUserId(nextId);
    localStorage.setItem('cramzero-user-id', nextId);
    setDisplayName('Student');
    setUserBio('');
    localStorage.removeItem('cramzero-user-bio');
    localStorage.setItem('cramzero-display-name', 'Student');
    setUserEmail('');
    localStorage.removeItem('cramzero-user-email');
    setAvatarUrl('https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e5ddd3');
    localStorage.setItem('cramzero-avatar-url', 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e5ddd3');
    setIsGuest(true);
    localStorage.setItem('cramzero-is-guest', 'true');
    setHasProfileSetup(false);
    localStorage.removeItem('cramzero-has-profile-setup');
    localStorage.removeItem('cramzero-access-token');
    toast.success('Signed out successfully');

    // Redirect to landing page only, without prompting any modals
    setShowAuthModal(false);
    handleNavigate('landing');
  };
  
  const [myDecks, setMyDecks] = useState([]);
  const [myHubs, setMyHubs] = useState([]);
  const [activeDeck, setActiveDeck] = useState(null);
  const [activeHub, setActiveHub] = useState(null);
  const [hasActiveDeck, setHasActiveDeck] = useState(false);
  
  const [examConfig, setExamConfig] = useState({ count: 10, timeMode: 'No Limit', isMock: false });

  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isTutorExpanded, setIsTutorExpanded] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  const [workspaceError, setWorkspaceError] = useState('');

  // --- DARK MODE STATE & EFFECT ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cramzero-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const handleSessionExpired = () => {
      localStorage.setItem('cramzero-session-draft', JSON.stringify({
        path: window.location.pathname,
        hash: window.location.hash,
        savedAt: new Date().toISOString(),
      }));
      setAuthModalMode('login');
      setShowAuthModal(true);
      toast.warning('Your session expired', { description: 'Sign in again to continue. Your current route was saved.' });
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('cramzero-session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('cramzero-session-expired', handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cramzero-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cramzero-theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (activeDeck) {
      setChatMessages([{ role: 'ai', content: `I see you are studying ${activeDeck.title}. Want me to explain any confusing terms?` }]);
    } else {
      setChatMessages([{ role: 'ai', content: `Hello! I'm Zero, your study assistant. Ask me anything about your notes or open a deck to get started!` }]);
    }
  }, [activeDeck]);

  // Close AI Tutor when navigating away from an active deck
  useEffect(() => {
    if (!['deck-details', 'flashcard-mode'].includes(currentView)) {
      setIsTutorOpen(false);
      setIsTutorExpanded(false);
    }
  }, [currentView]);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);
    recordAnalyticsEvent({ type: 'ai_question', deckTitle: activeDeck?.title || 'General tutor' });
    
    const contextStr = activeDeck && activeDeck.cards && activeDeck.cards.length > 0 
      ? activeDeck.cards.map((c, i) => `Card ${i + 1} -> Term: "${c.term}" | Definition: "${c.definition}"`).join('\n') 
      : "No specific deck currently open.";

    try {
      const res = await fetch(`${API_BASE}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, context: contextStr, user_id: userId })
      });
      
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 429) {
          const limitMsg = errData.detail || "Daily limit reached for Zero AI chats (30/30). You can continue chatting tomorrow!";
          setChatMessages(prev => [...prev, { role: 'ai', content: `⏳ **Daily Chat Limit Reached (30/30)**\n\n${limitMsg}` }]);
          toast.warning("Daily Chat Limit Reached", { description: "You have used your 30 AI chats for today." });
        } else {
          setChatMessages(prev => [...prev, { role: 'ai', content: errData.detail || "Sorry, my servers are a bit overloaded right now." }]);
        }
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', content: "Connection error. Please check your backend server." }]);
    } finally {
      setIsChatLoading(false);
    }
  };
  
  useEffect(() => {
    const sharedRoute = getSharedRoute(window.location.search);
    const hubCode = sharedRoute?.type === 'hub' ? sharedRoute.value : null;
    const deckId = sharedRoute?.type === 'deck' ? sharedRoute.value : null;
    const loadWorkspace = async () => {
        setWorkspaceError('');
      const decksPromise = fetch(`${API_BASE}/api/decks/?user_id=${encodeURIComponent(userId)}`);
      const hubsPromise = hubCode
        ? fetch(`${API_BASE}/api/study-hubs/join`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ invite_code: hubCode, user_id: userId, display_name: displayName }),
            })
        : fetch(`${API_BASE}/api/study-hubs?user_id=${encodeURIComponent(userId)}`);
      const sharedDeckPromise = deckId
        ? fetch(`${API_BASE}/api/decks/${encodeURIComponent(deckId)}?user_id=${encodeURIComponent(userId)}`)
        : null;

      const decksResponse = await decksPromise;
      const decks = await decksResponse.json();
      if (!decksResponse.ok) throw new Error('Could not load decks.');

      const hubsResponse = await hubsPromise;
      const hubData = await hubsResponse.json();
      if (!hubsResponse.ok) throw new Error(hubData.detail || 'Could not load study hubs.');

      const sharedDeckResponse = sharedDeckPromise ? await sharedDeckPromise : null;
      const sharedDeck = sharedDeckResponse ? await sharedDeckResponse.json() : null;
      if (sharedDeckResponse && !sharedDeckResponse.ok) {
        throw new Error(sharedDeck.detail || 'Could not load the shared deck.');
      }
      setMyDecks(decks.reverse());
      const hubs = hubCode ? [hubData] : hubData;
      setMyHubs(hubs);
      if (deckId && sharedDeck) {
        setActiveDeck(sharedDeck);
        setHasActiveDeck(true);
        setCurrentView('deck-details');
        window.history.replaceState({}, '', window.location.pathname);
      } else if (hubCode) {
        setActiveHub(hubData);
        setCurrentView('hub-details');
        window.history.replaceState({}, '', window.location.pathname);
      }
      setIsBooting(false);
    };

    loadWorkspace()
      .catch(err => {
        console.error("Backend offline or error:", err);
        setWorkspaceError(err.message || 'Could not load your workspace.');
        setIsBooting(false);
      });
  }, [userId, displayName]);

  const handleSpeak = async (text) => {
    try {
      if (await speakWithElevenLabs(text)) return;
    } catch (error) {
      console.warn('ElevenLabs text-to-speech fallback:', error);
      if (error.message.includes('VITE_ELEVENLABS_API_KEY')) {
        toast.info('Using system speech (ElevenLabs key not configured).');
      } else if (error.message.includes('402') || error.message.toLowerCase().includes('quota') || error.message.toLowerCase().includes('credit')) {
        toast.info('Using system speech (ElevenLabs free credits exhausted).');
      } else {
        toast.info('Using system speech (ElevenLabs service unavailable).');
      }
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0; 
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech is not supported in this browser.");
    }
  };
  
  const handleNavigate = (view) => {
    const isSetup = hasProfileSetup || localStorage.getItem('cramzero-has-profile-setup') === 'true' || !!localStorage.getItem('cramzero-user-email');
    if (view !== 'landing' && !isSetup) {
      setAuthModalMode('prompt');
      setShowAuthModal(true);
      return;
    }
    if (!document.startViewTransition) {
      setCurrentView(view);
    } else {
      document.startViewTransition(() => {
        flushSync(() => {
          setCurrentView(view);
        });
      });
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'study', label: 'Study', icon: BookOpen },
    { id: 'decks', label: 'Library', icon: Library },
    { id: 'hubs', label: 'Hubs', icon: Share2 },
    { id: 'social', label: 'People', icon: Users },
    { id: 'notifications', label: 'Inbox', icon: Inbox, badge: unreadNotificationCount },
    { id: 'analytics', label: 'Stats', icon: BarChart2 },
    { id: 'multiplayer', label: 'Play', icon: Zap },
    { id: 'codespace', label: 'CodeSpace', icon: Code },
  ];

  const focusViews = ['new-deck', 'deck-details', 'create-hub', 'hub-details', 'flashcard-mode', 'quiz-setup', 'mock-exam-setup', 'mock-exam-active'];
  const showNavDock = !focusViews.includes(currentView);
  const isInsideDeck = Boolean(activeDeck && ['deck-details', 'flashcard-mode'].includes(currentView));

  return (
    <>
      <Toaster 
        position="top-center" 
        theme={isDarkMode ? 'dark' : 'light'}
        richColors={false}
        toastOptions={{
          classNames: {
            toast: "group flex w-full items-center gap-4 rounded-2xl sm:rounded-full border border-stone-200/90 dark:border-white/15 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl py-3.5 sm:py-4 px-5 sm:px-6 shadow-2xl shadow-stone-900/20 dark:shadow-black/80 max-w-lg mx-auto transition-all animate-in fade-in slide-in-from-top-4 duration-300 min-h-[64px]",
            title: "text-base font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug",
            description: "text-sm font-medium text-stone-600 dark:text-zinc-300 mt-0.5 leading-relaxed",
            icon: "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base [&>svg]:w-5 [&>svg]:h-5 group-data-[type=error]:bg-rose-500/15 group-data-[type=error]:text-rose-600 dark:group-data-[type=error]:text-rose-400 group-data-[type=success]:bg-emerald-500/15 group-data-[type=success]:text-emerald-600 dark:group-data-[type=success]:text-emerald-400 group-data-[type=info]:bg-amber-500/15 group-data-[type=info]:text-amber-600 dark:group-data-[type=info]:text-amber-400",
            actionButton: "rounded-full font-bold bg-amber-500 text-white text-sm px-4 py-2 hover:bg-amber-600 transition-all shadow-xs",
            cancelButton: "rounded-full font-medium bg-stone-100 dark:bg-zinc-800 text-sm px-4 py-2",
          },
        }}
      />

      {/* Global Auth Modal: Can render cleanly over Landing Page or Workspace */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        userId={userId}
        initialMode={authModalMode}
        canDismiss={true}
        onAuthSuccess={handleAuthSuccess}
      />
      {currentView !== 'landing' && hasProfileSetup && isEducationProfileLoaded && !isEducationSetupDismissed && !showAuthModal && (!educationLevel || (educationLevel === 'Undergraduate' && !university)) && (
        <EducationSetupModal
          userId={userId}
          onComplete={(updated) => {
            if (updated?.education_level) {
              setEducationLevel(updated.education_level);
              localStorage.setItem('cramzero-education-level', updated.education_level);
            }
            if (updated?.university) {
              setUniversity(updated.university);
              localStorage.setItem('cramzero-university', updated.university);
            }
            if (updated) {
              setIsEducationSetupDismissed(false);
              localStorage.removeItem(`cramzero-education-skipped-${userId}`);
            }
            if (!updated) {
              localStorage.setItem(`cramzero-education-skipped-${userId}`, 'true');
              setIsEducationSetupDismissed(true);
            }
          }}
        />
      )}

      {currentView === 'landing' ? (
        <LandingPageView 
          navigateTo={handleNavigate} 
          hasProfileSetup={hasProfileSetup}
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          onOpenAuth={(m) => { setAuthModalMode(m || 'prompt'); setShowAuthModal(true); }}
        />
      ) : (
        <div className="cz-game-shell flex h-screen h-[100dvh] w-full overflow-hidden font-sans text-slate-900 transition-colors dark:text-zinc-100">
          <OnboardingTour currentView={currentView} navigateTo={handleNavigate} />

          <main className="cz-app-main flex flex-1 flex-col relative overflow-hidden">
            <header className="cz-game-header sticky top-0 z-20 shrink-0 px-3 py-2.5 backdrop-blur-xl transition-colors sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            {/* Brand Logo & Name (Protected with shrink-0, cannot collapse) */}
            <div className="flex items-center gap-2 cursor-pointer group shrink-0" onClick={() => handleNavigate('landing')}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-umber bg-amber-100 p-1 shadow-[0_3px_0_#26394d] transition-transform group-hover:-rotate-3 group-hover:scale-105 dark:border-amber-300 dark:bg-amber-200">
                <img src="/cramzero-logo.svg" alt="CramZero" className="h-full w-full" />
              </div>
              <h1 className="hidden select-none text-lg font-black tracking-tight text-umber dark:text-zinc-100 sm:block">CramZero</h1>
            </div>

            {/* Desktop Navigation Dock (Centered with flex-1 min-w-0, cannot overlap logo or push right controls) */}
            {showNavDock && (
              <div className="hidden md:flex flex-1 justify-center min-w-0 px-1 sm:px-2">
                <PrimaryNavigation items={navItems} currentView={currentView} onNavigate={handleNavigate} />
              </div>
            )}

            {/* Right Action Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <div className="cz-usage-trigger">
                <UsageTracker userId={userId} />
              </div>

              {/* User Profile Avatar Pill */}
              <button
                onClick={() => handleNavigate('profile')}
                className="cz-interactive flex items-center gap-1.5 rounded-2xl border-[3px] border-umber bg-amber-100 p-1 pl-1.5 pr-2 text-xs font-black text-slate-800 shadow-[0_3px_0_#26394d] hover:bg-amber-200 dark:border-amber-300 dark:bg-amber-950 dark:text-zinc-100 dark:hover:bg-amber-900 sm:pr-2.5"
                title="View Profile & Account"
              >
                <div className="relative w-6 h-6 rounded-full overflow-hidden bg-amber-200/80 shrink-0">
                  <img src={avatarUrl || 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e5ddd3'} alt={displayName} className="w-full h-full object-cover" />
                </div>
                <span className="hidden md:inline max-w-[70px] lg:max-w-[85px] truncate">{displayName}</span>
              </button>

              <div className="cz-theme-toggle flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-stone-100 dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 transition-colors">
                <Sun size={13} className="text-amber-600 dark:text-zinc-500" />
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} className="data-[state=checked]:bg-indigo-500 scale-90 sm:scale-100" />
                <Moon size={13} className="text-taupe dark:text-indigo-400" />
              </div>

              <Button variant="ghost" size="sm" onClick={() => handleNavigate('landing')} className="hidden font-bold text-taupe hover:text-umber dark:text-zinc-400 dark:hover:text-zinc-100 xl:flex">
                Exit Workspace
              </Button>
            </div>
          </div>

        </header>

        <div key={currentView} className={`cz-view-scroll flex-1 w-full overflow-y-auto no-scrollbar scroll-touch flex flex-col ${showNavDock ? 'pb-24 md:pb-6' : 'pb-6'} bg-transparent animate-in fade-in duration-300`}>
          {isOffline && (
            <div className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100" role="status">
              <span><strong>You’re offline.</strong> Saved content remains available; network actions will resume when you reconnect.</span>
              <button type="button" className="font-bold underline" onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}
          {workspaceError && myDecks.length === 0 && (
            <div className="mx-auto w-full max-w-2xl p-4 sm:p-8">
              <CoreState type={isOffline ? 'offline' : 'error'} title={isOffline ? 'Workspace is offline' : 'Workspace could not load'} description={isOffline ? 'Check your connection, then retry.' : workspaceError} actionLabel="Try again" onAction={() => window.location.reload()} />
            </div>
          )}
          {/* Main Views */}
          {isBooting ? (
            <WorkspaceSkeleton />
          ) : (
            <Suspense fallback={<WorkspaceSkeleton />}>
              {currentView === 'dashboard' && <DashboardView navigateTo={handleNavigate} setHasActiveDeck={setHasActiveDeck} setActiveDeck={setActiveDeck} myDecks={myDecks} displayName={displayName} />}
              {currentView === 'study' && <StudyView navigateTo={handleNavigate} hasActiveDeck={hasActiveDeck} setHasActiveDeck={setHasActiveDeck} setActiveDeck={setActiveDeck} myDecks={myDecks} />}
              {currentView === 'decks' && <DecksView navigateTo={handleNavigate} setActiveDeck={setActiveDeck} myDecks={myDecks} setMyDecks={setMyDecks} userId={userId} displayName={displayName} />}
              {currentView === 'profile' && (
                <ProfileView 
                  navigateTo={handleNavigate} 
                  userId={userId} 
                  displayName={displayName} 
                  setDisplayName={setDisplayName} 
                  userEmail={userEmail} 
                  setUserEmail={setUserEmail} 
                  avatarUrl={avatarUrl} 
                  setAvatarUrl={setAvatarUrl} 
                  bio={userBio}
                  setBio={setUserBio}
                  educationLevel={educationLevel === 'skipped' ? '' : educationLevel}
                  setEducationLevel={setEducationLevel}
                  university={university === 'skipped' ? '' : university}
                  setUniversity={setUniversity}
                  isGuest={isGuest} 
                  setIsGuest={setIsGuest} 
                  myDecks={myDecks} 
                  myHubs={myHubs} 
                  onOpenAuthModal={(m) => { setAuthModalMode(m || 'register'); setShowAuthModal(true); }}
                  onSignOut={handleSignOut}
                />
              )}
              {currentView === 'hubs' && <StudyHubsView navigateTo={handleNavigate} setActiveHub={setActiveHub} myHubs={myHubs} userId={userId} displayName={displayName} />}
              {currentView === 'social' && <SocialView navigateTo={handleNavigate} userId={userId} setActiveDeck={setActiveDeck} />}
              {currentView === 'notifications' && <NotificationsView navigateTo={handleNavigate} userId={userId} />}
              {currentView === 'analytics' && <AnalyticsView myDecks={myDecks} />}
              {currentView === 'new-deck' && <NewDeckView navigateTo={handleNavigate} myDecks={myDecks} setMyDecks={setMyDecks} userId={userId} setIsActionLoading={setIsActionLoading} setActionMessage={setActionMessage} />}
              {currentView === 'multiplayer' && <MultiplayerView navigateTo={handleNavigate} myDecks={myDecks} userDisplayName={displayName} userAvatarUrl={avatarUrl} setActiveDeck={setActiveDeck} />}
              {currentView === 'codespace' && <CodeSpaceView navigateTo={handleNavigate} />}
              
              {/* Sub Views */}
              {currentView === 'create-hub' && <CreateHubView navigateTo={handleNavigate} myHubs={myHubs} setMyHubs={setMyHubs} myDecks={myDecks} setMyDecks={setMyDecks} userId={userId} displayName={displayName} setIsActionLoading={setIsActionLoading} setActionMessage={setActionMessage} />}
              {currentView === 'hub-details' && <HubDetailsView navigateTo={handleNavigate} activeHub={activeHub} setActiveHub={setActiveHub} setMyHubs={setMyHubs} myDecks={myDecks} setMyDecks={setMyDecks} setActiveDeck={setActiveDeck} userId={userId} />}
              {currentView === 'deck-details' && <DeckDetailsView navigateTo={handleNavigate} activeDeck={activeDeck} setActiveDeck={setActiveDeck} setIsTutorOpen={setIsTutorOpen} userId={userId} displayName={displayName} myDecks={myDecks} setMyDecks={setMyDecks} />}
              {currentView === 'flashcard-mode' && <FlashcardModeView navigateTo={handleNavigate} activeDeck={activeDeck} setIsTutorOpen={setIsTutorOpen} />}
              
              {/* Wired Active Assessment Views */}
              {currentView === 'quiz-setup' && <QuizSetupView navigateTo={handleNavigate} activeDeck={activeDeck} setExamConfig={setExamConfig} />}
              {currentView === 'mock-exam-setup' && <MockExamSetupView navigateTo={handleNavigate} activeDeck={activeDeck} setExamConfig={setExamConfig} />}
              {currentView === 'mock-exam-active' && <MockExamActiveView navigateTo={handleNavigate} activeDeck={activeDeck} examConfig={examConfig} userId={userId} />}
            </Suspense>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        {showNavDock && (
          <MobileBottomNav items={navItems} currentView={currentView} onNavigate={handleNavigate} />
        )}
      </main>

      {/* Action Overlays for major creations (e.g. AI Deck Generation) */}
      {isActionLoading && (
        <div className="cz-loading-backdrop fixed inset-0 z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300 p-4">
          <div className="cz-loading-card max-w-sm w-full flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="cz-loading-mark relative mb-6">
              <div className="cz-loading-logo flex items-center justify-center">
                <img src="/cramzero-logo.svg" alt="CramZero" className="w-full h-full" />
              </div>
              <div className="cz-loading-orbit absolute -bottom-2 -right-2 flex items-center justify-center shadow-md">
                <RotateCw size={14} className="text-white animate-spin" />
              </div>
            </div>
            <h2 className="cz-loading-title mb-2">CramZero is cooking <span className="cz-loading-emoji" aria-hidden="true">🔎</span></h2>
            <p className="cz-loading-subtitle animate-pulse">{actionMessage || 'Synthesizing your materials'}</p>
          </div>
        </div>
      )}

      {/* Floating AI Tutor Button (Only visible when inside a deck) */}
      {isInsideDeck && !isTutorOpen && (
        <button 
          onClick={() => setIsTutorOpen(true)} 
          style={{ viewTransitionName: 'zero-ai-tutor-fab' }}
          className={`fixed ${showNavDock ? 'bottom-20 md:bottom-8' : 'bottom-5 md:bottom-8'} right-4 md:right-8 h-12 px-4 rounded-full bg-stone-900/95 dark:bg-zinc-100 text-white dark:text-zinc-950 backdrop-blur-xl border border-white/20 dark:border-black/10 shadow-2xl shadow-stone-900/25 hover:scale-105 active:scale-95 transition-all z-40 flex items-center gap-2.5 duration-300 ease-in-out group`}
        >
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white p-0.5">
            <img src="/zero-ai-avatar.webp" alt="" className="h-full w-full object-contain" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-stone-900 dark:border-zinc-100 rounded-full animate-pulse"></span>
          </div>
          <span className="text-xs font-bold tracking-tight">Ask Zero</span>
        </button>
      )}

      {/* Professor AI Chat Window */}
      {isInsideDeck && isTutorOpen && (
        <>
          {isTutorExpanded && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] animate-in fade-in duration-300" onClick={() => setIsTutorExpanded(false)} />}
          <aside className={`fixed bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-stone-200/90 dark:border-white/10 shadow-2xl flex flex-col z-[60] overflow-hidden transition-all duration-300 ease-in-out ${isTutorExpanded ? 'inset-2 sm:inset-4 md:inset-10 lg:inset-x-[15%] lg:inset-y-10 rounded-3xl' : 'bottom-0 left-0 right-0 max-h-[85vh] h-[520px] rounded-t-3xl md:bottom-8 md:right-8 md:left-auto md:w-[400px] md:h-[600px] md:rounded-3xl md:max-h-none animate-in slide-in-from-bottom-6'}`}>
            
            <div className="p-4 border-b border-stone-200/70 dark:border-zinc-800/80 bg-stone-50/70 dark:bg-zinc-900/80 backdrop-blur-md flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 p-1 border border-amber-300/60 dark:border-amber-800 shadow-sm">
                    <img src="/zero-ai-avatar.webp" alt="" className="h-full w-full object-contain" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-zinc-100 text-sm tracking-tight">Zero AI</h3>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 font-medium">Study Partner & Vocal Tutor</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsTutorExpanded(!isTutorExpanded)} className="text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800">
                  {isTutorExpanded ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
                <button onClick={() => { setIsTutorOpen(false); setIsTutorExpanded(false); }} className="text-stone-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30">
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className={`flex-1 overflow-y-auto bg-greige/10 dark:bg-zinc-900/50 flex flex-col ${isTutorExpanded ? 'p-6 md:p-8' : 'p-4 md:p-5'}`}>
              <div className="flex w-full flex-col gap-6">
                {chatMessages.map((msg, idx) => (
                  <Message key={idx} align={msg.role === 'user' ? 'end' : 'start'} className="w-full">
                    <MessageAvatar className="shrink-0 mt-auto">
                      <Avatar className="w-8 h-8 md:w-9 md:h-9 shadow-sm border border-taupe/20 dark:border-zinc-700">
                        <AvatarFallback className={`w-full h-full flex items-center justify-center font-bold text-[10px] md:text-xs rounded-full ${msg.role === 'ai' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-500' : 'bg-umber dark:bg-zinc-200 text-sand dark:text-zinc-900'}`}>
                          {msg.role === 'ai' ? <img src="/zero-ai-avatar.webp" alt="Zero AI" className="w-full h-full object-contain" /> : 'ME'}
                        </AvatarFallback>
                      </Avatar>
                    </MessageAvatar>
                    
                    <MessageContent className="max-w-[85%] md:max-w-[75%]">
                      <div className={`relative px-4 py-3 md:px-5 md:py-4 shadow-sm ${msg.role === 'user' ? 'bg-umber dark:bg-zinc-200 text-sand dark:text-zinc-900 rounded-3xl rounded-br-sm' : 'bg-white dark:bg-zinc-800 border border-taupe/20 dark:border-zinc-700 text-umber dark:text-zinc-100 rounded-3xl rounded-bl-sm'}`}>
                        <div className="whitespace-pre-wrap break-words text-[13px] md:text-sm leading-relaxed space-y-3">
                          <ReactMarkdown 
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-lg font-bold border-b border-black/10 dark:border-white/10 pb-1 mt-4 mb-2" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-base font-bold mt-3 mb-2" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-sm font-bold uppercase tracking-wider mt-3 mb-1" {...props} />,
                              p: ({node, ...props}) => <p className="leading-relaxed" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                              code: ({node, inline, ...props}) => 
                                inline ? <code className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-[13px]" {...props} /> 
                                       : <code className="block bg-black/10 dark:bg-white/10 p-3 rounded-lg text-[13px] overflow-x-auto my-2" {...props} />
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                        
                        {msg.role === 'ai' && (
                          <div className="flex justify-end mt-2 -mb-1 -mr-1">
                            <button onClick={() => handleSpeak(msg.content)} title="Listen to response" className="cursor-pointer text-taupe dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 bg-greige/30 dark:bg-zinc-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 p-1.5 rounded-full transition-all border border-transparent hover:border-amber-200 dark:hover:border-amber-800">
                              <Volume2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </MessageContent>
                  </Message>
                ))}

                {isChatLoading && (
                  <Marker role="status" className="mt-2 gap-2 px-1">
                    <MarkerContent className="flex items-center gap-2 text-xs text-taupe dark:text-zinc-400">
                      <img src="/zero-ai-message-badge.svg" alt="Zero AI message" className="h-9 w-auto shrink-0 opacity-90" />
                      <span className="shimmer"><span className="font-medium text-amber-600 dark:text-amber-500">Zero AI</span> is thinking...</span>
                    </MarkerContent>
                  </Marker>
                )}
              </div>
            </div>
            
            <div className={`bg-white dark:bg-zinc-950 border-t border-taupe/20 dark:border-zinc-800 shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] ${isTutorExpanded ? 'p-4 sm:p-6' : 'p-3 md:p-4'}`}>
              <div className="flex gap-2 items-end">
                <button className={`rounded-xl transition-all flex items-center justify-center shadow-sm border bg-greige/20 dark:bg-zinc-900 text-taupe dark:text-zinc-400 border-taupe/30 dark:border-zinc-800 ${isTutorExpanded ? 'p-4' : 'p-2.5 md:p-3'}`}>
                  <MicOff size={isTutorExpanded ? 24 : 20} />
                </button>
                <textarea 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                  placeholder="Ask Zero..." 
                  className={`flex-1 bg-greige/10 dark:bg-zinc-900 border border-taupe/30 dark:border-zinc-800 rounded-xl text-umber dark:text-zinc-100 placeholder:text-taupe dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all resize-none ${isTutorExpanded ? 'px-4 py-4 text-base h-[60px] min-h-[60px]' : 'px-3 py-2.5 text-xs md:text-sm h-[42px] min-h-[42px]'}`}
                />
                <button onClick={handleSendChat} disabled={isChatLoading || !chatInput.trim()} className={`bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 rounded-xl hover:bg-umber/90 dark:hover:bg-zinc-300 transition-all flex items-center justify-center shadow-sm disabled:opacity-50 ${isTutorExpanded ? 'p-4' : 'p-2.5 md:p-3'}`}>
                  <Send size={isTutorExpanded ? 22 : 18} />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
        </div>
      )}

      {isBooting && (
        <div className="cz-loading-screen fixed inset-0 z-[110] flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="cz-loading-mark relative mb-7">
            <div className="cz-loading-glow absolute inset-0 rounded-full animate-pulse"></div>
            <div className="cz-loading-logo relative z-10 flex items-center justify-center animate-bounce">
              <img src="/cramzero-logo.svg" alt="CramZero" className="w-full h-full" />
            </div>
            <div className="cz-loading-orbit absolute -bottom-2 -right-2 flex items-center justify-center shadow-lg z-20">
              <RotateCw size={16} className="text-white animate-spin" />
            </div>
          </div>
          <h2 className="cz-loading-title">CramZero is cooking <span className="cz-loading-emoji inline-block animate-bounce" aria-hidden="true">🔎</span></h2>
          <p className="cz-loading-subtitle animate-pulse">Firing up the engines</p>
        </div>
      )}
    </>
  );
}
