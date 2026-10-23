import { useState, useEffect, useRef, useCallback } from 'react';
import { flushSync } from 'react-dom';
import {
  BookOpen, Clock, FileText, Send, ChevronLeft, ChevronRight, RotateCw, Menu, X,
  MessageCircle, UploadCloud, Sparkles, Home, Library, Users, BarChart2, Play, Plus,
  ArrowLeft, Mic, MicOff, Volume2, VolumeX, Settings, Edit3, Trash2, HelpCircle, CheckCircle,
  Search, Layers, Brain, Zap, MessageSquare, TrendingUp, Calendar, Target,
  Shuffle, Maximize, Minimize, RotateCcw, Star, Check, ArrowRight, ShieldCheck, Award, Code, Cpu,
  Download, Share2, Timer, PieChart, Activity, AlertTriangle, Link as LinkIcon, Inbox,
  Sun, Moon, Copy, Trophy, Crown, Flame, Swords, Smile, Frown, Zap as ZapIcon, ThumbsUp, Heart, Ghost,
  MessageCircle as MessageCircleIcon
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
import { initAudio, preloadAllSfx, playSfx, playSfxIfAllowed, setSfxVolume, getSfxVolume, toggleSfxMute, isSfxMuted, SFX_NAMES, cleanupAudio } from '@/lib/sfx';

export function MultiplayerView({ navigateTo, myDecks, userDisplayName, userAvatarUrl, setActiveDeck }) {
  const [view, setView] = useState('menu');
  const [pinInput, setPinInput] = useState(() => new URLSearchParams(window.location.search).get('room') || '');
  const [lobbyPin, setLobbyPin] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [playerName, setPlayerName] = useState(() => userDisplayName || localStorage.getItem('cramzero-player-name') || 'Student');
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [serverError, setServerError] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const socketRef = useRef(null);
  const playerIdRef = useRef(null);
  const serverOffsetRef = useRef(0);
  
  const [players, setPlayers] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  
  const [timeLeft, setTimeLeft] = useState(15);
  const [countdown, setCountdown] = useState(3);
  const [questionStartedAt, setQuestionStartedAt] = useState(null);
  const [countdownStartedAt, setCountdownStartedAt] = useState(null);
  const [questionSeconds, setQuestionSeconds] = useState(15);
  const [answerResult, setAnswerResult] = useState(null);
  
  const [answeredStatus, setAnsweredStatus] = useState(new Set());
  const [roundScores, setRoundScores] = useState({});

  // Emote & Sound state
  const [emoteCooldown, setEmoteCooldown] = useState(0);
  const [activeEmotes, setActiveEmotes] = useState([]);
  const [showEmoteWheel, setShowEmoteWheel] = useState(false);
  const [sfxVolume, setSfxVolumeState] = useState(() => getSfxVolume());
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Emote helper functions
  const getEmoteEmoji = (emoteId) => {
    const emotes = {
      gg: '👏',
      nice: '👍',
      oops: '😅',
      mind_blown: '🤯',
      thinking: '🤔',
      laugh: '😂',
      sad: '😢',
      fire: '🔥',
    };
    return emotes[emoteId] || '❓';
  };

  const getEmoteLabel = (emoteId) => {
    const labels = {
      gg: 'Good Game',
      nice: 'Nice!',
      oops: 'Oops',
      mind_blown: 'Mind Blown',
      thinking: 'Thinking...',
      laugh: 'Haha',
      sad: 'Sad',
      fire: 'On Fire!',
    };
    return labels[emoteId] || 'Unknown';
  };

  // Sync player name if userDisplayName changes
  useEffect(() => {
    if (userDisplayName && playerName === 'Student') {
      setPlayerName(userDisplayName);
    }
  }, [userDisplayName]);

  // Native View Transition Helper
  const transitionTo = (newView) => {
    if (!document.startViewTransition) {
      setView(newView);
    } else {
      document.startViewTransition(() => {
        flushSync(() => {
          setView(newView);
        });
      });
    }
  };

  const applyRoomState = (room) => {
    if (typeof room.serverTime === 'number') {
      serverOffsetRef.current = room.serverTime - Date.now();
    }
    setLobbyPin(room.pin);
    setSelectedDeck(room.deck);
    setIsHost(room.hostId === playerIdRef.current);
    setPlayers(room.players.map((player) => ({ ...player, isMe: player.id === playerIdRef.current })));
    setCurrentQIndex(room.questionIndex);
    setQuestionStartedAt(room.questionStartedAt);
    setCountdownStartedAt(room.countdownStartedAt);
    setQuestionSeconds(room.questionSeconds);
    setAnsweredStatus(new Set(room.answeredPlayerIds));
    setRoundScores(room.scores);
    
    if (room.phase === 'countdown') {
      setSelectedAnswer(null);
      setAnswerResult(null);
      if (typeof room.countdownRemaining === 'number' && room.countdownRemaining > 0) {
        setCountdown(room.countdownRemaining);
      } else {
        setCountdown(3);
      }
    } else if (room.phase === 'playing') {
      if (typeof room.questionSecondsRemaining === 'number') {
        setTimeLeft(room.questionSecondsRemaining);
      }
    }

    const nextView = {
      lobby: 'lobby',
      countdown: 'countdown',
      playing: 'playing',
      'round-result': 'round-result',
      results: 'results',
      cancelled: 'cancelled',
    }[room.phase];
    if (nextView && view !== nextView) transitionTo(nextView);
  };

  const getMultiplayerWsUrl = () => {
    if (import.meta.env.VITE_MULTIPLAYER_WS_URL) {
      return import.meta.env.VITE_MULTIPLAYER_WS_URL;
    }
    if (API_BASE) {
      try {
        const parsed = new URL(API_BASE);
        const wsProto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${wsProto}//${parsed.host}/ws/multiplayer`;
      } catch {
        // Fallback below
      }
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}://${window.location.hostname}:8787`;
  };

  const connectToRoom = (message) => {
    if (!playerName.trim()) {
      setServerError('Enter a display name first.');
      return;
    }

    localStorage.setItem('cramzero-player-name', playerName.trim());
    setServerError('');
    setConnectionStatus('connecting');
    const wsUrl = getMultiplayerWsUrl();
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    const connectionTimeout = setTimeout(() => {
      if (socket.readyState === WebSocket.CONNECTING) {
        socket.close();
        setConnectionStatus('error');
        setServerError('Multiplayer server connection timed out. Please try again.');
      }
    }, 7000);

    socket.onopen = () => {
      clearTimeout(connectionTimeout);
      setConnectionStatus('connected');
      socket.send(JSON.stringify(message));
      // Initialize audio and preload sounds on first connection
      if (!audioInitialized) {
        initAudio();
        preloadAllSfx();
        setAudioInitialized(true);
      }
    };
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'connected') playerIdRef.current = payload.playerId;
      
      if (typeof payload.serverTime === 'number') {
        serverOffsetRef.current = payload.serverTime - Date.now();
      }

      // Authoritative real-time timer tick from server
      if (payload.type === 'timer_tick') {
        if (payload.phase === 'countdown' && typeof payload.countdown === 'number') {
          setCountdown(payload.countdown);
        } else if (payload.phase === 'playing' && typeof payload.timeLeft === 'number') {
          setTimeLeft(payload.timeLeft);
        }
        return;
      }

      if (payload.room) applyRoomState(payload.room);
      if (payload.type === 'answer_result') {
        setAnswerResult(payload);
        if (payload.isCorrect) {
          playSfx('answer_correct');
        } else {
          playSfx('answer_incorrect');
        }
      }
      if (payload.type === 'emote') {
        playSfx(`emote_${payload.emoteId}`);
        const emoteObj = { id: `${payload.playerId}-${payload.timestamp}`, ...payload };
        setActiveEmotes(prev => [...prev, emoteObj]);
        setTimeout(() => setActiveEmotes(prev => prev.filter(e => e.id !== emoteObj.id)), 3000);
      }
      if (payload.type === 'error') {
        setServerError(payload.message);
        setConnectionStatus('error');
        toast.error(payload.message);
      }
    };
    socket.onerror = () => {
      clearTimeout(connectionTimeout);
      setConnectionStatus('error');
      setServerError('Could not connect to the multiplayer server. Please verify your backend service is running.');
    };
    socket.onclose = () => {
      clearTimeout(connectionTimeout);
      setConnectionStatus('disconnected');
    };
  };

  const sendMessage = (message) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  const sendEmote = (emoteId) => {
    if (emoteCooldown > 0) return;
    sendMessage({ type: 'emote', emoteId });
    setEmoteCooldown(3000);
    setTimeout(() => setEmoteCooldown(0), 3000);
    playSfx('emote_sent');
  };

  const requestExit = () => setShowExitConfirm(true);

  const confirmExit = () => {
    sendMessage({ type: 'leave' });
    socketRef.current?.close();
    setShowExitConfirm(false);
    setPlayers([]);
    setLobbyPin('');
    setConnectionStatus('idle');
    transitionTo('menu');
  };

  const exitConfirmation = showExitConfirm && (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-umber/25 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md rounded-3xl border-taupe/30 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in zoom-in-95 duration-200">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"><X size={22} /></div>
          <div>
            <h2 className="text-lg font-bold text-umber dark:text-zinc-100">Leave this battle?</h2>
            <p className="mt-1 text-sm leading-relaxed text-taupe dark:text-zinc-400">Your match will be interrupted for the other player if you leave now.</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowExitConfirm(false)} className="rounded-xl font-bold text-taupe dark:text-zinc-400">Stay</Button>
          <Button onClick={confirmExit} className="rounded-xl bg-rose-600 font-bold text-white hover:bg-rose-700">Leave Battle</Button>
        </div>
      </Card>
    </div>
  );

  useEffect(() => () => socketRef.current?.close(), []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => cleanupAudio();
  }, []);

  // Emote Wheel Component
  const EmoteWheel = useCallback(({ isOpen, onClose, onSelect, disabled, cooldownMs }) => {
    if (!isOpen) return null;
    const emotes = [
      { id: 'gg', emoji: '👏', label: 'Good Game' },
      { id: 'nice', emoji: '👍', label: 'Nice!' },
      { id: 'oops', emoji: '😅', label: 'Oops' },
      { id: 'mind_blown', emoji: '🤯', label: 'Mind Blown' },
      { id: 'thinking', emoji: '🤔', label: 'Thinking...' },
      { id: 'laugh', emoji: '😂', label: 'Haha' },
      { id: 'sad', emoji: '😢', label: 'Sad' },
      { id: 'fire', emoji: '🔥', label: 'On Fire!' },
    ];

    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-in zoom-in-95 duration-200">
        <div className="relative flex flex-col items-center gap-2">
          {/* Emote Buttons Ring */}
          <div className="relative w-32 h-32" role="group" aria-label="Emotes">
            {emotes.map((emote, i) => {
              const angle = (i / emotes.length) * 2 * Math.PI - Math.PI / 2;
              const radius = 64;
              const x = radius * Math.cos(angle);
              const y = radius * Math.sin(angle);
              return (
                <button
                  key={emote.id}
                  onClick={() => { onSelect(emote.id); onClose(); }}
                  disabled={disabled}
                  className="absolute top-1/2 left-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-zinc-900 border-2 border-amber-300 dark:border-amber-800 shadow-lg text-2xl flex items-center justify-center transition-all duration-200 hover:scale-115 hover:border-amber-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
                  aria-label={emote.label}
                >
                  {emote.emoji}
                </button>
              );
            })}
          </div>

          {/* Center Close/Cooldown Button */}
          <button
            onClick={onClose}
            className="relative w-16 h-16 rounded-full bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 font-bold text-xl flex items-center justify-center shadow-lg border-2 border-amber-300 dark:border-amber-800 transition-all hover:scale-105"
            aria-label={disabled ? `Cooldown: ${Math.ceil(cooldownMs / 1000)}s` : 'Close emote wheel'}
          >
            {disabled ? (
              <>
                <svg className="w-8 h-8" viewBox="0 0 32 32">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={88}
                    strokeDashoffset={88 * (1 - cooldownMs / 3000)}
                    strokeLinecap="round"
                    className="text-amber-500"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                  />
                </svg>
                <span className="sr-only">Cooldown: {Math.ceil(cooldownMs / 1000)}s</span>
              </>
            ) : (
              <X size={20} />
            )}
          </button>
        </div>
      </div>
    );
  }, []);

  // Synchronized countdown fallback using server offset
  useEffect(() => {
    if (view !== 'countdown' || !countdownStartedAt) return undefined;
    const updateCountdown = () => {
      const nowOnServer = Date.now() + serverOffsetRef.current;
      const elapsed = Math.max(0, nowOnServer - countdownStartedAt);
      const rem = Math.max(1, Math.ceil((3000 - elapsed) / 1000));
      setCountdown(prev => (prev !== rem ? rem : prev));
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 250);
    return () => clearInterval(interval);
  }, [view, countdownStartedAt]);

  // Countdown sound effects
  useEffect(() => {
    if (view !== 'countdown') return;
    if (countdown === 3) playSfx('countdown_3');
    else if (countdown === 2) playSfx('countdown_2');
    else if (countdown === 1) playSfx('countdown_1');
    else if (countdown === 0) playSfx('countdown_go');
  }, [view, countdown]);

  // Synchronized question timer fallback using server offset
  useEffect(() => {
    if (view !== 'playing' || !questionStartedAt) return undefined;
    const updateTimer = () => {
      const nowOnServer = Date.now() + serverOffsetRef.current;
      const elapsed = Math.max(0, nowOnServer - questionStartedAt);
      const rem = Math.max(0, Math.ceil((questionSeconds * 1000 - elapsed) / 1000));
      setTimeLeft(prev => (prev !== rem ? rem : prev));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 250);
    return () => clearInterval(interval);
  }, [view, questionStartedAt, questionSeconds]);

  const handleHostDeckSelect = (deck) => {
    const playableDeck = {
      ...deck,
      cards: deck.cards.map((card) => {
        let others = deck.cards.filter((c) => c.term !== card.term).sort(() => 0.5 - Math.random());
        let distractors = others.slice(0, 3).map((c) => c.definition);
        while (distractors.length < 3) distractors.push('Generic Distractor ' + Math.random());
        return { ...card, options: [card.definition, ...distractors].sort(() => 0.5 - Math.random()) };
      }),
    };
    connectToRoom({ type: 'host', name: playerName.trim(), avatar: userAvatarUrl || '', deck: playableDeck });
  };

  const hostableDecks = myDecks.filter((deck) => deck.cards?.length > 0);

  const handleJoin = () => {
    const normalizedPin = pinInput.replace(/\D/g, '').slice(0, 6);
    setPinInput(normalizedPin);
    if (normalizedPin.length !== 6) {
      setServerError('Enter the 6-digit room PIN.');
      return;
    }
    connectToRoom({ type: 'join', name: playerName.trim(), avatar: userAvatarUrl || '', pin: normalizedPin });
  };

  const shareRoom = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${lobbyPin}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Join my CramZero battle', text: `Join my live CramZero battle with PIN ${lobbyPin}.`, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Room link copied');
      }
    } catch (error) {
      if (error.name !== 'AbortError') toast.error('Could not share the room link.');
    }
  };

  const handleUserAnswer = (opt) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(opt);
    sendMessage({ type: 'answer', answer: opt });
    playSfx('answer_locked');
  };

  const handleNextQuestion = () => {
    sendMessage({ type: 'next_question' });
  };

  const handleRematch = () => {
    sendMessage({ type: 'rematch' });
  };

  const handleStudyDeck = () => {
    if (selectedDeck && setActiveDeck) {
      setActiveDeck(selectedDeck);
      navigateTo('deck-details');
    } else {
      navigateTo('decks');
    }
  };

  const handleShareResult = async () => {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const p1 = sorted[0];
    const p2 = sorted[1];
    const text = `⚔️ CramZero Live Battle Recap\nDeck: "${selectedDeck?.title || 'Flashcards'}"\n🥇 ${p1 ? p1.name : 'Player 1'}: ${p1 ? p1.score.toLocaleString() : 0} pts\n🥈 ${p2 ? p2.name : 'Player 2'}: ${p2 ? p2.score.toLocaleString() : 0} pts\nChallenge me on CramZero!`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'CramZero Battle Result', text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Battle recap copied to clipboard!');
      }
    } catch {
      await navigator.clipboard.writeText(text);
      toast.success('Battle recap copied to clipboard!');
    }
  };

  if (view === 'select-deck') {
    return (
      <div className="max-w-5xl w-full mx-auto pb-16 px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300 space-y-6">
        <div>
          <Button variant="ghost" size="sm" onClick={() => transitionTo('menu')} className="-ml-3 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 font-semibold mb-2">
            <ArrowLeft size={16} className="mr-1.5" /> Back to Multiplayer
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/60 dark:border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  <Zap size={13} /> Host Mode
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-umber dark:text-zinc-100 tracking-tight">
                Select a Deck to Host
              </h2>
              <p className="text-xs sm:text-sm text-taupe dark:text-zinc-400 mt-0.5">
                Choose any deck to launch a live room. Other players will join using your 6-digit room PIN.
              </p>
            </div>

            {/* Display Name Box */}
            <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 rounded-2xl p-3 shadow-xs min-w-[240px]">
              <label className="block text-[10px] font-extrabold text-taupe dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Host Display Name
              </label>
              <Input 
                value={playerName} 
                maxLength={32} 
                onChange={(e) => setPlayerName(e.target.value)} 
                placeholder="Enter your name"
                className="h-10 bg-stone-50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 text-umber dark:text-zinc-100 rounded-xl text-sm font-semibold focus-visible:ring-amber-500" 
              />
            </div>
          </div>
        </div>

        {serverError && (
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400 animate-in fade-in">
            {serverError}
          </div>
        )}

        {connectionStatus === 'connecting' && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm font-medium text-amber-700 dark:text-amber-400 animate-pulse flex items-center gap-2">
            <RotateCw size={15} className="animate-spin text-amber-600" /> Connecting to live battle server...
          </div>
        )}
        
        {hostableDecks.length === 0 ? (
          <Card className="border-2 border-dashed border-stone-300 dark:border-zinc-800 shadow-none bg-white/60 dark:bg-zinc-900/60 p-12 text-center flex flex-col items-center justify-center rounded-3xl">
            <div className="w-16 h-16 bg-stone-100 dark:bg-zinc-800 text-umber dark:text-zinc-400 rounded-full flex items-center justify-center mb-4">
              <Zap size={30} />
            </div>
            <CardTitle className="text-xl font-bold text-umber dark:text-zinc-100 mb-2">No Playable Decks Found</CardTitle>
            <CardDescription className="text-taupe dark:text-zinc-400 mb-6 max-w-md mx-auto text-sm">
              Create a deck with at least one flashcard before hosting a live multiplayer challenge.
            </CardDescription>
            <Button onClick={() => navigateTo('new-deck')} className="bg-umber dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-umber/90 dark:hover:bg-zinc-200 font-bold rounded-xl h-11 px-6 shadow-xs">
              <Plus size={16} className="mr-2" /> Create a Deck
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hostableDecks.map(deck => (
              <Card 
                key={deck.id} 
                onClick={() => handleHostDeckSelect(deck)} 
                className="group relative rounded-2xl border border-stone-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between p-5 min-h-[160px]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider">
                      Flashcard Deck
                    </span>
                    <span className="text-xs text-taupe/80 dark:text-zinc-500 font-mono">
                      {new Date(deck.created_at || deck.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-umber dark:text-zinc-100 text-lg group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                    {deck.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-4 mt-2 border-t border-stone-100 dark:border-zinc-800/60">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-100 dark:bg-zinc-800 text-umber dark:text-zinc-200">
                    <Layers size={13} className="text-amber-600" />
                    {deck.cards?.length || 0} Cards
                  </span>
                  
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white group-hover:bg-amber-600 transition-all shadow-2xs group-hover:shadow-xs">
                    <Play size={11} fill="currentColor" /> Host Room
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Player join/leave sounds in lobby
  useEffect(() => {
    if (view !== 'lobby') return;
    if (players.length > 1) {
      // Check if a new player joined (simplified - just play on mount if >1 player)
      playSfx('player_join');
    }
  }, [view, players]);

  if (view === 'lobby') {
    return (
      <div className="max-w-3xl mx-auto pb-12 p-4 md:p-8 text-center mt-10 animate-in fade-in duration-300">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-left text-xl font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest">Waiting for players...</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSfxMute}
              className="text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100"
              title={isSfxMuted() ? 'Unmute sounds' : 'Mute sounds'}
            >
              {isSfxMuted() ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </Button>
            <Badge className="shrink-0 gap-2 rounded-full border-none bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live room</Badge>
          </div>
        </div>
        <Card className="p-6 md:p-10 shadow-sm mb-10 bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 rounded-2xl relative animate-in slide-in-from-bottom-2 duration-300">
          <p className="text-sm font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest mb-2">Join at CramZero with Pin:</p>
          <div className="flex items-center justify-center gap-4">
             <p className="text-5xl md:text-6xl font-mono font-bold text-umber dark:text-zinc-100 tracking-[0.2em]">{lobbyPin}</p>
             <button onClick={() => { navigator.clipboard.writeText(lobbyPin); toast.success("PIN Copied!"); }} className="p-3 bg-greige/30 dark:bg-zinc-800 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 rounded-xl transition-colors" title="Copy PIN"><Copy size={24}/></button>
          </div>
          <Button onClick={shareRoom} variant="outline" className="mt-5 border-umber dark:border-zinc-600 text-umber dark:text-zinc-300 hover:bg-greige/20 dark:hover:bg-zinc-800 rounded-xl font-bold">
            <Share2 size={16} className="mr-2" /> Share Room Link
          </Button>
        </Card>
        
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {players.map((p, i) => (
            <div key={p.id} style={{ animationDelay: `${i * 80}ms` }} className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
              {p.avatar ? (
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-sand dark:bg-zinc-800 border-2 border-umber dark:border-zinc-500 text-umber dark:text-zinc-100 flex items-center justify-center font-bold text-xl uppercase shadow-sm">
                  {p.name.substring(0, 2)}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-umber dark:text-zinc-300">{p.name}</p>
                {p.isMe && <Badge className="text-[10px] px-1.5 py-0 bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 border-none font-bold">You</Badge>}
                {p.isHost && <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-none font-bold">Host</Badge>}
              </div>
            </div>
          ))}
          {players.length === 1 && <div className="text-taupe dark:text-zinc-500 text-sm mt-5 w-full">Waiting for opponent to enter PIN {lobbyPin}...</div>}
        </div>

        {isHost ? (
          <Button size="lg" onClick={() => sendMessage({ type: 'start' })} disabled={players.length < 2 || connectionStatus !== 'connected'} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 h-11 px-10 rounded-xl font-bold text-lg shadow-md">
            Start Live Battle
          </Button>
        ) : (
          <Badge variant="outline" className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 px-6 py-4 rounded-xl font-bold text-sm">
            Waiting for host to start the game...
          </Badge>
        )}
        <div className="mt-5">
          <Button variant="ghost" onClick={requestExit} className="rounded-xl font-bold text-taupe dark:text-zinc-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400">Leave Room</Button>
        </div>
        {exitConfirmation}
      </div>
    );
  }

  // --- REVAMPED VERSUS MATCHUP COUNTDOWN ARENA ---
  if (view === 'countdown') {
    const p1 = players[0] || { name: 'Player 1', avatar: '', score: 0 };
    const p2 = players[1] || { name: 'Player 2', avatar: '', score: 0 };
    const strokeDash = 326.7; // 2 * PI * 52
    const strokeOffset = strokeDash * Math.max(0, (countdown - 1) / 3);

    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center justify-center min-h-[75vh] animate-in fade-in duration-300">
        <Card className="relative w-full max-w-2xl rounded-3xl border border-stone-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-8 sm:p-12 shadow-2xl overflow-hidden text-center">
          {/* Subtle warm arena lighting */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top arena badge */}
          <div className="flex flex-col items-center justify-center gap-1.5 mb-6 sm:mb-8">
            <Badge className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/80 px-3.5 py-1 text-xs font-bold rounded-full gap-1.5 shadow-2xs">
              <Zap size={13} className="text-amber-600 fill-amber-600" /> QUESTION {currentQIndex + 1} OF {selectedDeck?.cards?.length || 0}
            </Badge>
            <h3 className="text-sm sm:text-base font-bold text-taupe dark:text-zinc-400 truncate max-w-md">
              {selectedDeck?.title}
            </h3>
          </div>

          {/* Versus Matchup Stage */}
          <div className="grid grid-cols-7 items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-10">
            {/* Player 1 (Host / Challenger) */}
            <div className="col-span-3 flex flex-col items-center">
              <div className="relative mb-2">
                {p1.avatar ? (
                  <img
                    src={p1.avatar}
                    alt={p1.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl object-cover border-2 border-amber-500 shadow-lg shadow-amber-500/15"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-500 text-amber-800 dark:text-amber-300 flex items-center justify-center font-black text-xl sm:text-2xl shadow-lg">
                    {p1.name ? p1.name.slice(0, 2).toUpperCase() : 'P1'}
                  </div>
                )}
                {p1.isMe && (
                  <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-stone-900 dark:bg-zinc-100 text-[10px] font-black text-white dark:text-zinc-950 uppercase shadow-xs">
                    You
                  </span>
                )}
              </div>
              <p className="font-extrabold text-sm sm:text-base text-umber dark:text-zinc-100 truncate max-w-[120px] sm:max-w-[160px]">
                {p1.name}
              </p>
              <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {(roundScores[p1.id] || p1.score || 0).toLocaleString()} pts
              </span>
            </div>

            {/* Pulsing VS Center Badge */}
            <div className="col-span-1 flex items-center justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-md shadow-amber-500/30 animate-pulse">
                VS
              </div>
            </div>

            {/* Player 2 (Challenger) */}
            <div className="col-span-3 flex flex-col items-center">
              <div className="relative mb-2">
                {p2.avatar ? (
                  <img
                    src={p2.avatar}
                    alt={p2.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl object-cover border-2 border-stone-300 dark:border-zinc-700 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-stone-100 dark:bg-zinc-800 border-2 border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 flex items-center justify-center font-black text-xl sm:text-2xl shadow-lg">
                    {p2.name ? p2.name.slice(0, 2).toUpperCase() : 'P2'}
                  </div>
                )}
                {p2.isMe && (
                  <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-stone-900 dark:bg-zinc-100 text-[10px] font-black text-white dark:text-zinc-950 uppercase shadow-xs">
                    You
                  </span>
                )}
              </div>
              <p className="font-extrabold text-sm sm:text-base text-umber dark:text-zinc-100 truncate max-w-[120px] sm:max-w-[160px]">
                {p2.name}
              </p>
              <span className="font-mono text-xs font-bold text-taupe dark:text-zinc-400 mt-0.5">
                {(roundScores[p2.id] || p2.score || 0).toLocaleString()} pts
              </span>
            </div>
          </div>

          {/* Circular Countdown Dial */}
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-36 h-36 sm:w-40 sm:h-40 transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="52"
                className="stroke-stone-200 dark:stroke-zinc-800"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="52"
                className="stroke-amber-500 transition-all duration-300 ease-out"
                strokeWidth="7"
                strokeDasharray={strokeDash}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                key={countdown}
                className="text-5xl sm:text-6xl font-black text-umber dark:text-zinc-100 tracking-tight animate-in zoom-in-75 duration-200"
              >
                {countdown > 0 ? countdown : 'GO!'}
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400 mt-0.5">
                {countdown === 3 ? 'Get Ready' : countdown === 2 ? 'Locked In' : countdown === 1 ? 'Focus!' : 'Battle!'}
              </span>
            </div>
          </div>

          {/* Match Tip */}
          <p className="mt-4 text-xs font-semibold text-taupe dark:text-zinc-500 max-w-sm mx-auto">
            ⚡ Quick answers score up to <span className="text-amber-600 dark:text-amber-400 font-bold">1,000 pts</span> each. Speed + accuracy wins!
          </p>

          <div className="mt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={requestExit}
              className="text-taupe dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl font-semibold"
            >
              Exit Match
            </Button>
          </div>
        </Card>
        {exitConfirmation}
      </div>
    );
  }

  if (view === 'cancelled') {
    return (
      <Card className="mx-auto mt-12 max-w-xl rounded-2xl border-taupe/30 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in zoom-in-95 duration-300">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"><Users size={30} /></div>
        <h2 className="text-2xl font-bold text-umber dark:text-zinc-100">Battle discontinued</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-taupe dark:text-zinc-400">{selectedDeck?.title ? `The battle for ${selectedDeck.title} ended because there was no longer another player in the room.` : 'The battle ended because there was no longer another player in the room.'}</p>
        <Button onClick={() => transitionTo('menu')} className="mt-7 h-11 rounded-xl bg-umber px-6 font-bold text-sand hover:bg-umber/90 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300">Back to Multiplayer</Button>
      </Card>
    );
  }

  if (['countdown', 'playing', 'round-result'].includes(view) && !selectedDeck?.cards?.length) {
    return (
      <Card className="mx-auto mt-12 max-w-xl rounded-2xl border-taupe/30 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in duration-300">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"><RotateCw size={26} className="animate-spin" /></div>
        <h2 className="text-xl font-bold text-umber dark:text-zinc-100">Restoring battle</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-taupe dark:text-zinc-400">The live room is still syncing. You can return to Multiplayer if the session is no longer available.</p>
        <Button onClick={confirmExit} className="mt-6 h-11 rounded-xl bg-umber px-6 font-bold text-sand hover:bg-umber/90 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300">Return to Multiplayer</Button>
      </Card>
    );
  }

  // Round end sound
  useEffect(() => {
    if (view === 'round-result') {
      playSfx('round_end');
    }
  }, [view]);

  if (view === 'round-result') {
    const currentCard = selectedDeck.cards[currentQIndex];
    const isCorrect = answerResult?.isCorrect || false;
    const myPoints = roundScores[playerIdRef.current] || 0;

    return (
      <div className="max-w-5xl w-full mx-auto pb-8 relative">
        <div className="bg-sand/90 dark:bg-zinc-950/90 backdrop-blur-md pb-4 mb-6 border-b border-taupe/20 dark:border-zinc-800 flex justify-between items-end transition-colors shrink-0 px-2 md:px-0">
          <div>
            <p className="text-[10px] font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
              Round Complete
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-umber dark:text-zinc-100 truncate max-w-[250px] md:max-w-md">
              Question {currentQIndex + 1}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmoteWheel(true)}
              disabled={emoteCooldown > 0}
              className="text-taupe dark:text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 disabled:opacity-50"
              title={emoteCooldown > 0 ? `Emote cooldown: ${Math.ceil(emoteCooldown / 1000)}s` : 'Send Emote'}
            >
              <MessageCircleIcon size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSfxMute}
              className="text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100"
              title={isSfxMuted() ? 'Unmute sounds' : 'Mute sounds'}
            >
              {isSfxMuted() ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={requestExit} className="text-taupe dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 -mr-2" title="Quit Match">
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="pb-2 px-2 md:px-0 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="p-8 md:p-12 text-center bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 shadow-md rounded-3xl">
              {isCorrect ? (
                <>
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} /></div>
                  <h2 className="text-3xl font-black text-emerald-600 dark:text-emerald-500 mb-2">Correct!</h2>
                  <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white px-4 py-1.5 text-lg font-bold rounded-xl border-none">+{myPoints}</Badge>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4"><X size={32} /></div>
                  <h2 className="text-3xl font-black text-rose-600 dark:text-rose-500 mb-2">Incorrect</h2>
                  <Badge className="bg-rose-500 hover:bg-rose-500 text-white px-4 py-1.5 text-lg font-bold rounded-xl border-none">+0</Badge>
                </>
              )}
            </Card>

            <Card className="rounded-3xl p-6 shadow-sm bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800">
              <p className="font-bold text-umber dark:text-zinc-100 mb-4 text-sm md:text-base leading-relaxed">What is the definition of "{currentCard.term}"?</p>
              <div className="space-y-1.5 text-xs md:text-sm bg-sand/30 dark:bg-zinc-950 p-4 rounded-xl border border-taupe/20 dark:border-zinc-800">
                <p className="text-taupe dark:text-zinc-400 flex flex-col md:flex-row md:items-start gap-1 md:gap-2">
                  <span className="shrink-0 font-medium">Your Answer:</span> 
                  <span className={`font-semibold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{!selectedAnswer ? 'Skipped' : selectedAnswer}</span>
                </p>
                {!isCorrect && (
                  <p className="text-taupe dark:text-zinc-400 flex flex-col md:flex-row md:items-start gap-1 md:gap-2 mt-2 pt-2 border-t border-taupe/20 dark:border-zinc-800">
                    <span className="shrink-0 font-medium">Correct Answer:</span> 
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{currentCard.definition}</span>
                  </p>
                )}
              </div>
            </Card>
          </div>

          <Card className="lg:col-span-1 rounded-3xl p-6 shadow-sm flex flex-col h-fit lg:sticky lg:top-4 bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800">
            <h3 className="font-bold text-umber dark:text-zinc-100 mb-4 flex items-center gap-2 border-b border-taupe/20 dark:border-zinc-800 pb-4"><Target size={18}/> Leaderboard</h3>
            <div className="flex-1 space-y-3">
              {players.map((p, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${p.isMe ? 'bg-sand dark:bg-amber-950/20 border-amber-300 dark:border-amber-800' : 'bg-greige/10 dark:bg-zinc-950 border-taupe/20 dark:border-zinc-800'}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-taupe dark:text-zinc-500 w-4">{i + 1}</span>
                    {p.avatar ? (
                      <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-amber-500 shadow-2xs" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-taupe/20 dark:border-zinc-700 text-umber dark:text-zinc-100 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                        {p.name.substring(0, 2)}
                      </div>
                    )}
                    <span className={`font-bold text-sm ${p.isMe ? 'text-amber-800 dark:text-amber-500' : 'text-umber dark:text-zinc-300'}`}>{p.name}</span>
                  </div>
                  <span className="font-mono font-bold text-umber dark:text-zinc-100">{p.score}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {isHost && (
          <div className="w-full flex justify-end items-center border-t border-taupe/20 dark:border-zinc-800 mt-6 pt-4 transition-colors px-2 md:px-0">
            <Button onClick={handleNextQuestion} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 h-12 px-8 rounded-xl font-bold shadow-md transition-all">
              {currentQIndex < selectedDeck.cards.length - 1 ? 'Next Question' : 'Show Battle Results'} <ChevronRight size={18} className="ml-2" />
            </Button>
          </div>
        )}

        {/* Emote Bubbles */}
        {activeEmotes.map((emote) => {
          const sender = players.find(p => p.id === emote.playerId);
          if (!sender) return null;
          const isP1 = sender === players[0];
          return (
            <div
              key={emote.id}
              className={`fixed z-[50] animate-in zoom-in-95 duration-200 pointer-events-none ${
                isP1 ? 'bottom-[60%] left-1/2 -translate-x-1/2' : 'bottom-[60%] right-1/2 translate-x-1/2'
              }`}
              style={{ transform: isP1 ? 'translateX(-50%) translateY(0)' : 'translateX(50%) translateY(0)' }}
            >
              <div className="bg-white dark:bg-zinc-900 border-2 border-amber-300 dark:border-amber-800 rounded-2xl px-4 py-2 shadow-lg flex flex-col items-center gap-1">
                <span className="text-3xl">{getEmoteEmoji(emote.emoteId)}</span>
                <span className="text-xs font-bold text-umber dark:text-zinc-100">{getEmoteLabel(emote.emoteId)}</span>
              </div>
            </div>
          );
        })}

        {/* Emote Wheel */}
        <EmoteWheel
          isOpen={showEmoteWheel}
          onClose={() => setShowEmoteWheel(false)}
          onSelect={sendEmote}
          disabled={emoteCooldown > 0}
          cooldownMs={emoteCooldown}
        />

        {exitConfirmation}
      </div>
    );
  }

  // --- PLAYING VIEW ---
  if (view === 'playing') {
    const currentQ = selectedDeck?.cards[currentQIndex];
    const p1 = players[0];
    const p2 = players[1];

    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col min-h-full pb-8 px-4 sm:px-6 relative animate-in fade-in duration-200 space-y-4">
        {/* Top Arena Header */}
        <div className="bg-sand/90 dark:bg-zinc-950/90 backdrop-blur-md pb-4 border-b border-taupe/20 dark:border-zinc-800 flex justify-between items-center transition-colors shrink-0">
          <div>
            <p className="text-[10px] font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
              <Zap size={12}/> Live Battle • Question {currentQIndex + 1} of {selectedDeck?.cards?.length || 0}
            </p>
            <h2 className="text-lg md:text-xl font-bold text-umber dark:text-zinc-100 truncate max-w-[220px] sm:max-w-md">
              {selectedDeck?.title}
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge variant="outline" className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 font-mono font-bold text-sm md:text-base border transition-colors ${timeLeft < 5 ? 'text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 animate-pulse' : 'text-umber dark:text-zinc-100 border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'}`}>
              <Timer size={16} /> {timeLeft}s
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSfxMute}
              className="text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100"
              title={isSfxMuted() ? 'Unmute sounds' : 'Mute sounds'}
            >
              {isSfxMuted() ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmoteWheel(true)}
              disabled={emoteCooldown > 0}
              className="text-taupe dark:text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 disabled:opacity-50"
              title={emoteCooldown > 0 ? `Emote cooldown: ${Math.ceil(emoteCooldown / 1000)}s` : 'Send Emote'}
            >
              <MessageCircleIcon size={20} />
            </Button>
            <Button variant="ghost" size="icon" onClick={requestExit} className="text-taupe dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30" title="Quit Match">
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Live Tug-of-War Score Bar between both contenders */}
        {p1 && p2 && (
          <div className="rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5 px-1">
              <div className="flex items-center gap-2 truncate max-w-[140px] sm:max-w-[200px]">
                {p1.avatar ? (
                  <img src={p1.avatar} alt={p1.name} className="w-5 h-5 rounded-full object-cover border border-amber-500 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-black shrink-0">1</div>
                )}
                <span className="text-umber dark:text-zinc-200 truncate">{p1.name} {p1.isMe && '(You)'}</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 shrink-0">{p1.score}</span>
              </div>

              <span className="text-[10px] uppercase font-black tracking-wider text-taupe dark:text-zinc-500">Live Match</span>

              <div className="flex items-center gap-2 truncate max-w-[140px] sm:max-w-[200px] justify-end">
                <span className="font-mono text-stone-600 dark:text-zinc-400 shrink-0">{p2.score}</span>
                <span className="text-umber dark:text-zinc-200 truncate">{p2.name} {p2.isMe && '(You)'}</span>
                {p2.avatar ? (
                  <img src={p2.avatar} alt={p2.name} className="w-5 h-5 rounded-full object-cover border border-stone-400 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-stone-500 text-white text-[9px] flex items-center justify-center font-black shrink-0">2</div>
                )}
              </div>
            </div>
            {/* Visual ratio bar */}
            <div className="h-1.5 w-full bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
              <div
                className="bg-amber-500 transition-all duration-300"
                style={{
                  width: `${(p1.score + p2.score === 0) ? 50 : Math.max(10, Math.min(90, (p1.score / (p1.score + p2.score)) * 100))}%`
                }}
              />
              <div
                className="bg-stone-400 dark:bg-zinc-600 transition-all duration-300 flex-1"
              />
            </div>
          </div>
        )}

        <div className="flex-1 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col">
            <Card className="rounded-3xl p-6 sm:p-8 shadow-md flex flex-col mb-4 bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 min-h-[160px] animate-in slide-in-from-bottom-2 duration-300">
              <span className="text-[10px] font-bold uppercase tracking-widest text-taupe dark:text-zinc-500 mb-2">Identify definition</span>
              <h3 className="text-xl md:text-2xl font-bold text-umber dark:text-zinc-100 leading-relaxed text-center my-auto">
                "{currentQ?.term}"
              </h3>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentQ?.options.map((opt, i) => {
                const isSelected = selectedAnswer === opt;
                return (
                  <button 
                    key={i} 
                    disabled={selectedAnswer !== null}
                    onClick={() => handleUserAnswer(opt)}
                    className={`w-full p-5 sm:p-6 rounded-2xl border-2 text-left font-medium transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 dark:border-amber-600 text-amber-800 dark:text-amber-400 shadow-md scale-[1.01]' 
                        : selectedAnswer !== null 
                          ? 'bg-white/50 dark:bg-zinc-950/50 border-taupe/20 dark:border-zinc-800/50 opacity-60 text-umber dark:text-zinc-300 cursor-not-allowed'
                          : 'bg-white dark:bg-zinc-950 border-taupe/30 dark:border-zinc-800 text-umber dark:text-zinc-300 hover:border-amber-500 dark:hover:border-amber-600 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 active:scale-[0.99]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${isSelected ? 'bg-amber-500 text-white' : 'bg-stone-100 dark:bg-zinc-800 text-taupe dark:text-zinc-400'}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm sm:text-base leading-snug">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedAnswer !== null && (
              <p className="mt-4 text-center text-xs font-bold text-amber-700 dark:text-amber-400 animate-pulse flex items-center justify-center gap-1.5">
                <CheckCircle size={14} /> Answer locked in! Waiting for round completion...
              </p>
            )}
          </div>

          {/* Status Sidebar */}
          <Card className="lg:col-span-1 rounded-3xl p-6 shadow-sm flex flex-col h-fit bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800">
            <h3 className="font-bold text-umber dark:text-zinc-100 mb-4 flex items-center gap-2 border-b border-taupe/20 dark:border-zinc-800 pb-3">
              <Target size={18}/> Contender Status
            </h3>
            <div className="space-y-3">
              {players.map((p, i) => {
                const hasAnswered = answeredStatus.has(p.id);
                return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${p.isMe ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800' : 'bg-stone-50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800'}`}>
                    <div className="flex items-center gap-2.5">
                      {p.avatar ? (
                        <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-amber-500 shadow-2xs" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-taupe/20 dark:border-zinc-700 text-umber dark:text-zinc-100 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          {p.name.substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className={`font-bold text-sm ${p.isMe ? 'text-amber-800 dark:text-amber-400' : 'text-umber dark:text-zinc-200'}`}>{p.name}</p>
                        <p className="text-[10px] text-taupe dark:text-zinc-400 font-mono">{p.score} pts</p>
                      </div>
                    </div>
                    {hasAnswered ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle size={15} /> Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-taupe dark:text-zinc-400">
                        <RotateCw size={13} className="animate-spin text-amber-600" /> Thinking
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Emote Bubbles */}
        {activeEmotes.map((emote) => {
          const sender = players.find(p => p.id === emote.playerId);
          if (!sender) return null;
          const isP1 = sender === players[0];
          return (
            <div
              key={emote.id}
              className={`fixed z-[50] animate-in zoom-in-95 duration-200 pointer-events-none ${
                isP1 ? 'bottom-[60%] left-1/2 -translate-x-1/2' : 'bottom-[60%] right-1/2 translate-x-1/2'
              }`}
              style={{ transform: isP1 ? 'translateX(-50%) translateY(0)' : 'translateX(50%) translateY(0)' }}
            >
              <div className="bg-white dark:bg-zinc-900 border-2 border-amber-300 dark:border-amber-800 rounded-2xl px-4 py-2 shadow-lg flex flex-col items-center gap-1">
                <span className="text-3xl">{getEmoteEmoji(emote.emoteId)}</span>
                <span className="text-xs font-bold text-umber dark:text-zinc-100">{getEmoteLabel(emote.emoteId)}</span>
              </div>
            </div>
          );
        })}

        {/* Emote Wheel */}
        <EmoteWheel
          isOpen={showEmoteWheel}
          onClose={() => setShowEmoteWheel(false)}
          onSelect={sendEmote}
          disabled={emoteCooldown > 0}
          cooldownMs={emoteCooldown}
        />

        {exitConfirmation}
      </div>
    );
  }

  // Match result sounds
  useEffect(() => {
    if (view !== 'results') return;
    const finalStandings = [...players].sort((a, b) => b.score - a.score);
    const winner = finalStandings[0];
    const isWinner = winner?.isMe;
    const isTie = finalStandings.length > 1 && finalStandings[0].score === finalStandings[1].score;

    if (isTie) {
      playSfx('match_draw');
    } else if (isWinner) {
      playSfx('match_victory');
    } else {
      playSfx('match_defeat');
    }
  }, [view, players]);

  // --- ELEVATED BATTLE RESULTS PODIUM ARENA ---
  if (view === 'results') {
    const finalStandings = [...players].sort((a, b) => b.score - a.score);
    const winner = finalStandings[0];
    const runnerUp = finalStandings[1];
    const isWinner = winner?.isMe;
    const isTie = finalStandings.length > 1 && finalStandings[0].score === finalStandings[1].score;
    const scoreGap = finalStandings.length > 1 ? Math.abs(finalStandings[0].score - finalStandings[1].score) : 0;
    const totalPoints = finalStandings.reduce((total, player) => total + player.score, 0);

    const winnerStats = winner?.stats || { correct: 0, total: selectedDeck?.cards?.length || 0, streak: 0, maxStreak: 0 };
    const runnerUpStats = runnerUp?.stats || { correct: 0, total: selectedDeck?.cards?.length || 0, streak: 0, maxStreak: 0 };

    const totalQuestions = selectedDeck?.cards?.length || Math.max(winnerStats.total, 1);
    const winnerAcc = Math.round((winnerStats.correct / Math.max(winnerStats.total, 1)) * 100);
    const runnerUpAcc = Math.round((runnerUpStats.correct / Math.max(runnerUpStats.total, 1)) * 100);

    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
        {/* Outcome Header Banner */}
        <Card className="relative overflow-hidden rounded-3xl border border-stone-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-6 sm:p-8 shadow-xl text-center">
          <div className="absolute -top-20 -left-20 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-52 h-52 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-3 shadow-2xs">
            <Trophy size={14} className="text-amber-600" />
            {isTie ? 'Split Decision • Dead Heat' : isWinner ? 'Victory Royale • Match Winner' : 'Match Finished • Well Fought'}
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-umber dark:text-zinc-100 tracking-tight">
            {isTie
              ? 'Deadlock Draw!'
              : isWinner
              ? 'Champion of the Arena!'
              : `${winner?.name} Takes the Crown!`}
          </h2>

          <p className="mt-2 text-sm sm:text-base text-taupe dark:text-zinc-400 max-w-xl mx-auto">
            {isTie
              ? `Both contenders posted matching scores across ${totalQuestions} questions.`
              : isWinner
              ? `You dominated the match with a decisive +${scoreGap.toLocaleString()} point lead!`
              : `A fierce battle for "${selectedDeck?.title}". Ready for revenge?`}
          </p>

          {/* 3D Olympic Podium Arena */}
          <div className="flex items-end justify-center gap-4 sm:gap-8 pt-10 pb-2 max-w-lg mx-auto">
            {/* 2nd Place Pedestal (Runner Up) */}
            {runnerUp && (
              <div className="flex flex-col items-center flex-1 max-w-[170px] animate-in slide-in-from-bottom-4 duration-500">
                <div className="relative mb-2">
                  {runnerUp.avatar ? (
                    <img
                      src={runnerUp.avatar}
                      alt={runnerUp.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-stone-300 dark:border-zinc-700 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-100 dark:bg-zinc-800 border-2 border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 flex items-center justify-center font-black text-xl shadow-md">
                      {runnerUp.name ? runnerUp.name.slice(0, 2).toUpperCase() : 'P2'}
                    </div>
                  )}
                  <span className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-stone-300 dark:bg-zinc-700 border-2 border-white dark:border-zinc-900 text-stone-800 dark:text-zinc-100 text-xs font-black flex items-center justify-center shadow-xs">
                    2
                  </span>
                </div>

                <p className="font-extrabold text-xs sm:text-sm text-umber dark:text-zinc-100 truncate w-full">
                  {runnerUp.name} {runnerUp.isMe && '(You)'}
                </p>
                <p className="font-mono text-xs font-bold text-taupe dark:text-zinc-400 mb-2">
                  {runnerUp.score.toLocaleString()} pts
                </p>

                {/* Silver Pedestal Step */}
                <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-b from-stone-200 via-stone-300 to-stone-400 dark:from-zinc-800 dark:via-zinc-850 dark:to-zinc-900 border-t-4 border-stone-300 dark:border-zinc-700 flex flex-col items-center justify-center shadow-md p-2">
                  <Award size={24} className="text-stone-500 dark:text-zinc-400 mb-1" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-stone-700 dark:text-zinc-300">
                    2nd Place
                  </span>
                </div>
              </div>
            )}

            {/* 1st Place Pedestal (Winner) */}
            {winner && (
              <div className="flex flex-col items-center flex-1 max-w-[190px] animate-in slide-in-from-bottom-6 duration-600">
                <div className="relative mb-2">
                  {/* Floating Golden Crown */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                    <Crown size={22} fill="currentColor" />
                  </div>
                  {winner.avatar ? (
                    <img
                      src={winner.avatar}
                      alt={winner.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-3 border-amber-500 shadow-xl shadow-amber-500/25"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-amber-100 dark:bg-amber-950/70 border-3 border-amber-500 text-amber-900 dark:text-amber-200 flex items-center justify-center font-black text-2xl shadow-xl">
                      {winner.name ? winner.name.slice(0, 2).toUpperCase() : 'P1'}
                    </div>
                  )}
                  <span className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shadow-sm">
                    1
                  </span>
                </div>

                <p className="font-extrabold text-sm sm:text-base text-umber dark:text-zinc-100 truncate w-full">
                  {winner.name} {winner.isMe && '(You)'}
                </p>
                <p className="font-mono text-sm font-black text-amber-600 dark:text-amber-400 mb-2">
                  {winner.score.toLocaleString()} pts
                </p>

                {/* Gold Pedestal Step */}
                <div className="w-full h-40 sm:h-48 rounded-t-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 dark:from-amber-600/90 dark:via-amber-700 dark:to-amber-900 border-t-4 border-amber-200 text-stone-950 dark:text-white flex flex-col items-center justify-center shadow-xl p-2">
                  <Trophy size={30} className="text-amber-900 dark:text-amber-200 mb-1" />
                  <span className="text-xs font-black uppercase tracking-widest text-amber-950 dark:text-amber-100">
                    Champion
                  </span>
                  <span className="text-[10px] font-bold opacity-80 mt-0.5">
                    +{scoreGap.toLocaleString()} pts
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Head-to-Head Tale of the Tape & Match Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Accuracy Breakdown */}
          <Card className="rounded-2xl border border-stone-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target size={14} className="text-amber-600" /> Match Accuracy
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-umber dark:text-zinc-200 truncate max-w-[120px]">{winner?.name}</span>
                  <span className="font-mono text-amber-700 dark:text-amber-400">{winnerStats.correct}/{totalQuestions} ({winnerAcc}%)</span>
                </div>
                <Progress value={winnerAcc} className="h-2 bg-stone-100 dark:bg-zinc-800" />
              </div>
              {runnerUp && (
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-umber dark:text-zinc-200 truncate max-w-[120px]">{runnerUp?.name}</span>
                    <span className="font-mono text-stone-600 dark:text-zinc-400">{runnerUpStats.correct}/{totalQuestions} ({runnerUpAcc}%)</span>
                  </div>
                  <Progress value={runnerUpAcc} className="h-2 bg-stone-100 dark:bg-zinc-800" />
                </div>
              )}
            </div>
          </Card>

          {/* Longest Streak */}
          <Card className="rounded-2xl border border-stone-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame size={14} className="text-orange-500" /> Peak Combo Streak
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                <p className="text-[10px] font-bold text-taupe dark:text-zinc-400 truncate">{winner?.name}</p>
                <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{winnerStats.maxStreak || winnerStats.correct || 0}x</p>
                <p className="text-[10px] font-semibold text-taupe dark:text-zinc-500">Consecutive</p>
              </div>
              {runnerUp && (
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-800">
                  <p className="text-[10px] font-bold text-taupe dark:text-zinc-400 truncate">{runnerUp?.name}</p>
                  <p className="text-2xl font-black text-stone-700 dark:text-zinc-300">{runnerUpStats.maxStreak || runnerUpStats.correct || 0}x</p>
                  <p className="text-[10px] font-semibold text-taupe dark:text-zinc-500">Consecutive</p>
                </div>
              )}
            </div>
          </Card>

          {/* Match Summary */}
          <Card className="rounded-2xl border border-stone-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-taupe dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-amber-600" /> Match Deck
              </span>
            </div>
            <p className="font-extrabold text-sm text-umber dark:text-zinc-100 line-clamp-1">{selectedDeck?.title}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-taupe dark:text-zinc-400">
              <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 font-semibold">{totalQuestions} Questions</span>
              <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 font-semibold">{totalPoints.toLocaleString()} Total Pts</span>
            </div>
            <p className="mt-3 text-[11px] text-taupe dark:text-zinc-500 leading-snug">
              Reviewing cards immediately after battles cements memory retention by up to 2.4x.
            </p>
          </Card>
        </div>

        {/* Stable Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {isHost ? (
              <Button
                onClick={handleRematch}
                className="h-12 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 font-bold text-white shadow-md flex items-center gap-2 w-full sm:w-auto"
              >
                <RotateCw size={17} /> Play Rematch (Same Pin)
              </Button>
            ) : (
              <div className="h-12 px-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2 w-full sm:w-auto justify-center">
                <RotateCw size={14} className="animate-spin text-amber-600" />
                Waiting for host to start rematch...
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleStudyDeck}
              className="h-12 px-5 rounded-xl border-stone-200 dark:border-zinc-800 font-bold text-umber dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 w-full sm:w-auto"
            >
              <BookOpen size={16} className="mr-2 text-amber-600" /> Study This Deck
            </Button>

            <Button
              variant="outline"
              onClick={handleShareResult}
              className="h-12 px-4 rounded-xl border-stone-200 dark:border-zinc-800 font-bold text-umber dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 w-full sm:w-auto"
              title="Share match score"
            >
              <Share2 size={16} className="mr-1.5" /> Share
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={confirmExit}
            className="h-12 px-5 rounded-xl font-bold text-taupe dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 w-full sm:w-auto"
          >
            Leave Match
          </Button>
        </div>

        {exitConfirmation}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center pb-12 p-4 md:p-8 animate-in fade-in duration-300">
      <div className="md:col-span-2 max-w-md w-full mx-auto">
        <label className="block text-xs font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-2 text-center">Display name</label>
        <Input
          type="text"
          maxLength={32}
          placeholder="e.g. Alex"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full h-12 text-center bg-white dark:bg-zinc-900 border-taupe/40 dark:border-zinc-800 text-umber dark:text-zinc-100 focus-visible:ring-umber dark:focus-visible:ring-zinc-600 rounded-xl"
        />
        {(serverError || connectionStatus === 'connecting') && (
          <p className={`text-xs text-center mt-2 ${serverError ? 'text-rose-600 dark:text-rose-400' : 'text-taupe dark:text-zinc-500'}`}>
            {serverError || 'Connecting to live multiplayer...'}
          </p>
        )}
      </div>
      <Card className="p-6 md:p-8 rounded-2xl shadow-sm text-center bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800">
        <div className="w-16 h-16 bg-greige/30 dark:bg-zinc-800 text-umber dark:text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-6"><Users size={32}/></div>
        <h2 className="text-xl md:text-2xl font-bold text-umber dark:text-zinc-100 mb-2">Join a Lobby</h2>
        <p className="text-taupe dark:text-zinc-400 text-xs md:text-sm mb-6">Enter your classmate's 6-digit session pin to join the live quiz.</p>
        <Input 
          type="text" 
          placeholder="e.g. 123456" 
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full text-center text-xl md:text-2xl tracking-[0.5em] font-mono h-16 bg-sand/30 dark:bg-zinc-950 border-taupe/40 dark:border-zinc-800 focus-visible:ring-umber dark:focus-visible:ring-zinc-600 rounded-xl mb-4 text-umber dark:text-zinc-100" 
        />
        <Button size="lg" onClick={handleJoin} className="w-full bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 h-12 rounded-xl font-medium">
          Join Session
        </Button>
      </Card>
      
      <Card className="bg-sand/40 dark:bg-zinc-900/40 p-6 md:p-8 rounded-2xl shadow-sm text-center h-full flex flex-col justify-center border-taupe/30 dark:border-zinc-800">
        <h2 className="text-xl md:text-2xl font-bold text-umber dark:text-zinc-100 mb-2">Host a Lobby</h2>
        <p className="text-taupe dark:text-zinc-400 text-xs md:text-sm mb-6">Select one of your existing decks and challenge your friends in real-time.</p>
        <Button variant="outline" size="lg" onClick={() => transitionTo('select-deck')} className="w-full h-12 rounded-xl font-medium border-2 border-umber dark:border-zinc-500 text-umber dark:text-zinc-300 hover:bg-umber/5 dark:hover:bg-zinc-800 hover:text-umber dark:hover:text-zinc-100 bg-transparent">
          Select Deck to Host
        </Button>
      </Card>
    </div>
  );
}
