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

export function MultiplayerView({ navigateTo, myDecks }) {
  const [view, setView] = useState('menu');
  const [pinInput, setPinInput] = useState(() => new URLSearchParams(window.location.search).get('room') || '');
  const [lobbyPin, setLobbyPin] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('cramzero-player-name') || 'Student');
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [serverError, setServerError] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const socketRef = useRef(null);
  const playerIdRef = useRef(null);
  
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

  const connectToRoom = (message) => {
    if (!playerName.trim()) {
      setServerError('Enter a display name first.');
      return;
    }

    localStorage.setItem('cramzero-player-name', playerName.trim());
    setServerError('');
    setConnectionStatus('connecting');
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(import.meta.env.VITE_MULTIPLAYER_WS_URL || `${protocol}://${window.location.hostname}:8787`);
    socketRef.current = socket;
    const connectionTimeout = setTimeout(() => {
      if (socket.readyState === WebSocket.CONNECTING) {
        socket.close();
        setConnectionStatus('error');
        setServerError('Multiplayer server is unavailable. Restart the app with npm run dev.');
      }
    }, 5000);

    socket.onopen = () => {
      clearTimeout(connectionTimeout);
      setConnectionStatus('connected');
      socket.send(JSON.stringify(message));
    };
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'connected') playerIdRef.current = payload.playerId;
      if (payload.room) applyRoomState(payload.room);
      if (payload.type === 'answer_result') setAnswerResult(payload);
      if (payload.type === 'error') {
        setServerError(payload.message);
        setConnectionStatus('error');
        toast.error(payload.message);
      }
    };
    socket.onerror = () => {
      clearTimeout(connectionTimeout);
      setConnectionStatus('error');
      setServerError('Could not connect to the multiplayer server. Run npm run dev and try again.');
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

  useEffect(() => {
    if (view !== 'countdown' || !countdownStartedAt) return undefined;
    const updateCountdown = () => setCountdown(Math.max(0, 3 - Math.floor((Date.now() - countdownStartedAt) / 1000)));
    updateCountdown();
    const interval = setInterval(updateCountdown, 250);
    return () => clearInterval(interval);
  }, [view, countdownStartedAt]);

  useEffect(() => {
    if (view !== 'playing' || !questionStartedAt) return undefined;
    const updateTimer = () => setTimeLeft(Math.max(0, questionSeconds - Math.ceil((Date.now() - questionStartedAt) / 1000)));
    updateTimer();
    const interval = setInterval(updateTimer, 250);
    return () => clearInterval(interval);
  }, [view, questionStartedAt, questionSeconds]);

  const handleHostDeckSelect = (deck) => {
    const playableDeck = {
        ...deck,
        cards: deck.cards.map(card => {
            let others = deck.cards.filter(c => c.term !== card.term).sort(() => 0.5 - Math.random());
            let distractors = others.slice(0, 3).map(c => c.definition);
            while(distractors.length < 3) distractors.push("Generic Distractor " + Math.random());
            return { ...card, options: [card.definition, ...distractors].sort(() => 0.5 - Math.random()) };
        })
    };
    connectToRoom({ type: 'host', name: playerName.trim(), deck: playableDeck });
  };

  const hostableDecks = myDecks.filter((deck) => deck.cards?.length > 0);

  const handleJoin = () => {
    const normalizedPin = pinInput.replace(/\D/g, '').slice(0, 6);
    setPinInput(normalizedPin);
    if (normalizedPin.length !== 6) {
      setServerError('Enter the 6-digit room PIN.');
      return;
    }
    connectToRoom({ type: 'join', name: playerName.trim(), pin: normalizedPin });
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
  };

  const handleNextQuestion = () => {
      sendMessage({ type: 'next_question' });
  };

  if (view === 'select-deck') {
    return (
      <div className="max-w-5xl mx-auto pb-12 p-4 md:p-8">
        <Button variant="ghost" onClick={() => transitionTo('menu')} className="-ml-4 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 mb-6 font-medium">
          <ArrowLeft size={16} className="mr-2" /> Back to Multiplayer
        </Button>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-umber dark:text-zinc-100">Select a Deck to Host</h2>
            <p className="text-sm text-taupe dark:text-zinc-400 mt-1">Choose the deck for your live room.</p>
          </div>
          <div className="w-full md:w-64">
            <label className="block text-[10px] font-bold text-taupe dark:text-zinc-500 uppercase tracking-wider mb-1">Your display name</label>
            <Input value={playerName} maxLength={32} onChange={(e) => setPlayerName(e.target.value)} className="h-10 bg-white dark:bg-zinc-900 border-taupe/40 dark:border-zinc-800 text-umber dark:text-zinc-100 rounded-lg" />
          </div>
        </div>
        {serverError && (
          <div className="mb-6 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">
            {serverError}
          </div>
        )}
        {connectionStatus === 'connecting' && (
          <div className="mb-6 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm font-medium text-amber-700 dark:text-amber-400">
            Connecting to the live room...
          </div>
        )}
        
          {hostableDecks.length === 0 ? (
           <Card className="border-2 border-dashed border-taupe/30 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-900 p-12 text-center flex flex-col items-center justify-center rounded-3xl">
              <div className="w-16 h-16 bg-greige/30 dark:bg-zinc-800 text-umber dark:text-zinc-400 rounded-full flex items-center justify-center mb-4"><Zap size={32} /></div>
              <CardTitle className="text-xl text-umber dark:text-zinc-100 mb-2">No playable decks</CardTitle>
              <CardDescription className="text-taupe dark:text-zinc-500 mb-6 max-w-md mx-auto">Create a deck with at least one card before hosting a live multiplayer battle.</CardDescription>
              <Button onClick={() => navigateTo('new-deck')} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 font-bold rounded-xl h-12">Create a Deck</Button>
           </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostableDecks.map(deck => (
              <Card key={deck.id} onClick={() => handleHostDeckSelect(deck)} className="bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-40 relative group rounded-xl">
                <CardContent className="pt-5 pb-0">
                  <h3 className="font-semibold text-umber dark:text-zinc-100 text-lg group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors pr-8 truncate">{deck.title}</h3>
                  <p className="text-xs text-taupe dark:text-zinc-500 mt-1">{new Date(deck.createdAt || Date.now()).toLocaleDateString()}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between mt-auto pb-5">
                  <Badge variant="secondary" className="bg-sand dark:bg-zinc-800 text-umber dark:text-zinc-300 font-bold hover:bg-sand dark:hover:bg-zinc-800 border-none">{deck.cards?.length || 0} Cards</Badge>
                  <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50 font-bold gap-1 border-none"><Play size={12} fill="currentColor" /> Host</Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === 'lobby') {
    return (
      <div className="max-w-3xl mx-auto pb-12 p-4 md:p-8 text-center mt-10 animate-in fade-in duration-300">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-left text-xl font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest">Waiting for players...</h2>
          <Badge className="shrink-0 gap-2 rounded-full border-none bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live room</Badge>
        </div>
        <Card className="p-6 md:p-10 shadow-sm mb-10 bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 rounded-3xl relative animate-in slide-in-from-bottom-2 duration-300">
          <p className="text-sm font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest mb-2">Join at CramZero with Pin:</p>
          <div className="flex items-center justify-center gap-4">
             <p className="text-6xl md:text-7xl font-mono font-black text-umber dark:text-zinc-100 tracking-[0.2em]">{lobbyPin}</p>
             <button onClick={() => { navigator.clipboard.writeText(lobbyPin); toast.success("PIN Copied!"); }} className="p-3 bg-greige/30 dark:bg-zinc-800 text-taupe dark:text-zinc-400 hover:text-umber dark:hover:text-zinc-100 rounded-xl transition-colors"><Copy size={24}/></button>
          </div>
          <Button onClick={shareRoom} variant="outline" className="mt-5 border-umber dark:border-zinc-600 text-umber dark:text-zinc-300 hover:bg-greige/20 dark:hover:bg-zinc-800 rounded-xl font-bold">
            <Share2 size={16} className="mr-2" /> Share Room Link
          </Button>
        </Card>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {players.map((p, i) => (
            <div key={p.id} style={{ animationDelay: `${i * 80}ms` }} className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-sand dark:bg-zinc-800 border-2 border-umber dark:border-zinc-500 text-umber dark:text-zinc-100 flex items-center justify-center font-bold text-xl uppercase shadow-sm">
                {p.name.substring(0,2)}
              </div>
              <p className="text-sm font-bold text-umber dark:text-zinc-300">{p.name}</p>
            </div>
          ))}
          {players.length === 1 && <div className="text-taupe dark:text-zinc-500 text-sm mt-5 w-full">Waiting for others to join...</div>}
        </div>

        {isHost ? (
          <Button size="lg" onClick={() => sendMessage({ type: 'start' })} disabled={players.length < 2 || connectionStatus !== 'connected'} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 h-14 px-10 rounded-xl font-bold text-lg shadow-md">
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

  if (view === 'countdown') {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center animate-in fade-in duration-300">
         <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-taupe dark:text-zinc-500">Get ready</p>
         <div key={countdown} className="text-[12rem] font-black text-umber dark:text-zinc-100 animate-in zoom-in duration-300">
            {countdown}
         </div>
      </div>
    );
  }

  if (view === 'cancelled') {
    return (
      <Card className="mx-auto mt-12 max-w-xl rounded-3xl border-taupe/30 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in zoom-in-95 duration-300">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"><Users size={30} /></div>
        <h2 className="text-2xl font-black text-umber dark:text-zinc-100">Battle discontinued</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-taupe dark:text-zinc-400">{selectedDeck?.title ? `The battle for ${selectedDeck.title} ended because there was no longer another player in the room.` : 'The battle ended because there was no longer another player in the room.'}</p>
        <Button onClick={() => transitionTo('menu')} className="mt-7 h-12 rounded-xl bg-umber px-6 font-bold text-sand hover:bg-umber/90 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300">Back to Multiplayer</Button>
      </Card>
    );
  }

  if (['countdown', 'playing', 'round-result'].includes(view) && !selectedDeck?.cards?.length) {
    return (
      <Card className="mx-auto mt-12 max-w-xl rounded-3xl border-taupe/30 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in duration-300">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"><RotateCw size={26} className="animate-spin" /></div>
        <h2 className="text-xl font-black text-umber dark:text-zinc-100">Restoring battle</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-taupe dark:text-zinc-400">The live room is still syncing. You can return to Multiplayer if the session is no longer available.</p>
        <Button onClick={confirmExit} className="mt-6 h-11 rounded-xl bg-umber px-6 font-bold text-sand hover:bg-umber/90 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300">Return to Multiplayer</Button>
      </Card>
    );
  }

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
             <Button variant="ghost" size="icon" onClick={requestExit} className="text-taupe dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 -mr-2" title="Quit Match">
               <X size={20} />
             </Button>
           </div>

           <div className="pb-2 px-2 md:px-0 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 flex flex-col gap-6">
                 <Card className={`p-8 md:p-12 text-center bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 shadow-md rounded-3xl`}>
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
                          <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-taupe/20 dark:border-zinc-700 text-umber dark:text-zinc-100 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                            {p.name.substring(0,2)}
                          </div>
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
                    {currentQIndex < selectedDeck.cards.length - 1 ? "Next Question" : "Show Podium"} <ChevronRight size={18} className="ml-2" />
                 </Button>
               </div>
           )}
            {exitConfirmation}
          </div>
      );
  }

  if (view === 'playing') {
    const currentQ = selectedDeck?.cards[currentQIndex];
    return (
      <div className="max-w-4xl w-full mx-auto flex flex-col h-[calc(100vh-10rem)] relative">
        <div className="bg-sand/90 dark:bg-zinc-950/90 backdrop-blur-md pb-4 mb-6 border-b border-taupe/20 dark:border-zinc-800 flex justify-between items-end transition-colors shrink-0 px-2 md:px-0">
          <div>
            <p className="text-[10px] font-bold text-taupe dark:text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
              <Zap size={12}/> Live Battle • Question {currentQIndex + 1} of {selectedDeck?.cards?.length || 0}
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-umber dark:text-zinc-100 truncate max-w-[250px] md:max-w-md">
              {selectedDeck?.title}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Badge variant="outline" className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono font-bold text-sm md:text-base border-taupe/30 dark:border-zinc-700 ${timeLeft < 6 ? 'text-rose-600 dark:text-rose-400 animate-pulse bg-rose-50 dark:bg-rose-900/30' : 'text-umber dark:text-zinc-100'}`}>
              <Timer size={16} /> {timeLeft}s
            </Badge>
            <Button variant="ghost" size="icon" onClick={requestExit} className="text-taupe dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 -mr-2" title="Quit Match">
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="flex-1 pb-6 px-2 md:px-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col">
            <Card className="rounded-3xl p-6 shadow-md flex flex-col mb-4 bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800 min-h-[160px] animate-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-xl md:text-2xl font-medium text-umber dark:text-zinc-100 leading-relaxed text-center my-auto">
                What is the definition of "{currentQ?.term}"?
              </h3>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ?.options.map((opt, i) => {
                const isSelected = selectedAnswer === opt;
                return (
                  <button 
                    key={i} 
                    disabled={selectedAnswer !== null}
                    onClick={() => handleUserAnswer(opt)}
                    className={`w-full p-6 rounded-2xl border-2 text-left font-medium transition-all ${
                      isSelected 
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 dark:border-amber-600 text-amber-800 dark:text-amber-400 shadow-md scale-[1.02]' 
                        : selectedAnswer !== null 
                          ? 'bg-white/50 dark:bg-zinc-950/50 border-taupe/20 dark:border-zinc-800/50 opacity-60 text-umber dark:text-zinc-300'
                          : 'bg-white dark:bg-zinc-950 border-taupe/30 dark:border-zinc-800 text-umber dark:text-zinc-300 hover:border-umber dark:hover:border-zinc-600 hover:bg-greige/10 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          <Card className="lg:col-span-1 rounded-3xl p-6 shadow-sm flex flex-col h-[50vh] lg:h-full overflow-hidden bg-white dark:bg-zinc-900 border-taupe/30 dark:border-zinc-800">
            <h3 className="font-bold text-umber dark:text-zinc-100 mb-4 flex items-center gap-2 border-b border-taupe/20 dark:border-zinc-800 pb-4"><Target size={18}/> Status</h3>
            <div className="flex-1 space-y-3">
              {players.map((p, i) => {
                const hasAnswered = answeredStatus.has(p.id);
                return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${p.isMe ? 'bg-sand dark:bg-amber-950/20 border-amber-300 dark:border-amber-800' : 'bg-greige/10 dark:bg-zinc-950 border-taupe/20 dark:border-zinc-800'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-taupe/20 dark:border-zinc-700 text-umber dark:text-zinc-100 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                        {p.name.substring(0,2)}
                      </div>
                      <span className={`font-bold text-sm ${p.isMe ? 'text-amber-800 dark:text-amber-500' : 'text-umber dark:text-zinc-300'}`}>{p.name}</span>
                    </div>
                    {hasAnswered ? <CheckCircle size={18} className="text-emerald-500" /> : <RotateCw size={14} className="text-taupe dark:text-zinc-500 animate-spin" />}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
        {exitConfirmation}
      </div>
    );
  }

  if (view === 'results') {
    const finalStandings = [...players].sort((a, b) => b.score - a.score);
    const winner = finalStandings[0];
    const totalPoints = finalStandings.reduce((total, player) => total + player.score, 0);

    return (
      <Card className="max-w-3xl mx-auto animate-in zoom-in duration-300 text-center mt-6 md:mt-10 rounded-3xl p-6 md:p-10 shadow-xl border-taupe/30 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm animate-in zoom-in duration-500">
          <Award size={42} />
        </div>
        <h2 className="text-4xl font-black text-umber dark:text-zinc-100 mb-2">Battle Complete!</h2>
        <p className="text-taupe dark:text-zinc-400 mb-6 text-base md:text-lg">Here is the final tally.</p>

        {winner && (
          <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30 animate-in slide-in-from-bottom-2 duration-500">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Winner</p>
            <p className="mt-1 text-2xl font-black text-umber dark:text-zinc-100">{winner.name}{winner.isMe ? ' (You)' : ''}</p>
            <p className="mt-1 font-mono text-lg font-bold text-amber-700 dark:text-amber-400">{winner.score.toLocaleString()} points</p>
          </div>
        )}

        <div className="mb-8 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-xl border border-taupe/20 bg-sand/30 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-[10px] font-bold uppercase tracking-wider text-taupe dark:text-zinc-500">Players</p>
            <p className="mt-1 text-xl font-black text-umber dark:text-zinc-100">{finalStandings.length}</p>
          </div>
          <div className="rounded-xl border border-taupe/20 bg-sand/30 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-[10px] font-bold uppercase tracking-wider text-taupe dark:text-zinc-500">Points awarded</p>
            <p className="mt-1 text-xl font-black text-umber dark:text-zinc-100">{totalPoints.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="mb-8 space-y-3 text-left">
          {finalStandings.map((p, i) => (
            <div key={i} className={`flex items-center justify-between p-5 rounded-2xl border ${i === 0 ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 scale-105 shadow-md' : p.isMe ? 'bg-sand dark:bg-zinc-800/80 border-amber-200 dark:border-amber-800/50' : 'bg-greige/10 dark:bg-zinc-950 border-taupe/20 dark:border-zinc-800'}`}>
              <div className="flex items-center gap-4">
                <span className={`font-black text-xl w-6 ${i === 0 ? 'text-amber-600 dark:text-amber-500' : 'text-taupe dark:text-zinc-600'}`}>{i + 1}</span>
                <span className={`font-bold text-lg ${p.isMe ? 'text-amber-800 dark:text-amber-400' : 'text-umber dark:text-zinc-300'}`}>{p.name} {p.isMe && '(You)'}</span>
              </div>
              <span className="font-mono font-bold text-xl text-umber dark:text-zinc-100">{p.score}</span>
            </div>
          ))}
        </div>

        <Button size="lg" onClick={() => transitionTo('menu')} className="bg-umber dark:bg-zinc-100 text-sand dark:text-zinc-900 hover:bg-umber/90 dark:hover:bg-zinc-300 h-14 rounded-xl font-bold w-full shadow-md">
          Back to Multiplayer Menu
        </Button>
      </Card>
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
