import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle, ChevronLeft, ChevronRight, X, Heart, KeyRound,
  Timer, Check, Layers, RotateCcw,
  Sparkles, ArrowLeft, Target, ShieldCheck, Volume2, VolumeX, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { addInAppNotification } from '@/lib/inAppNotifications';
import { recordAnalyticsEvent } from '@/lib/analytics';
import { ensureSfxEnabledByDefault, initAudio, playSfx, playSfxSequence, isSfxMuted, toggleSfxMute } from '@/lib/sfx';
import { API_BASE } from '@/lib/api';

const SESSION_HEART_LIMIT = 7;
const SESSION_KEY_LIMIT = 5;
const DAILY_HEART_LIMIT = 30;
const DAILY_KEY_LIMIT = 30;
const DAILY_USAGE_STORAGE_KEY = 'cramzero-quiz-daily-usage';

const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const readDailyUsage = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(DAILY_USAGE_STORAGE_KEY) || 'null');
    if (stored?.date === getTodayKey()) {
      return {
        hearts: Number.isFinite(stored.hearts) ? stored.hearts : 0,
        keys: Number.isFinite(stored.keys) ? stored.keys : 0,
      };
    }
  } catch (error) {
    console.warn('Unable to read quiz daily usage; resetting counters.', error);
  }
  return { hearts: 0, keys: 0 };
};

export function MockExamActiveView({ navigateTo, activeDeck, examConfig, userId }) {
  const safeDeck = activeDeck || { title: "Loading Assessment...", cards: [] }; 
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [eliminatedOptions, setEliminatedOptions] = useState({});
  const [attempts, setAttempts] = useState({});
  const [missedQuestions, setMissedQuestions] = useState([]);
  const [feedbackState, setFeedbackState] = useState({});
  const [hintVisible, setHintVisible] = useState({});
  const [explanationVisible, setExplanationVisible] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(null);
  const [hearts, setHearts] = useState(SESSION_HEART_LIMIT);
  const [hintKeys, setHintKeys] = useState(SESSION_KEY_LIMIT);
  const [dailyUsage, setDailyUsage] = useState(readDailyUsage);
  const [dailyLimits, setDailyLimits] = useState({ hearts: DAILY_HEART_LIMIT, keys: DAILY_KEY_LIMIT, unlimited: false });
  const [xpFeedback, setXpFeedback] = useState(null);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [successOverlay, setSuccessOverlay] = useState(null);
  const [sessionEndReason, setSessionEndReason] = useState('');
  const [isSoundMuted, setIsSoundMuted] = useState(() => isSfxMuted());
  const timerCuesPlayedRef = useRef(new Set());
  const autoAdvanceTimerRef = useRef(null);
  const successOverlayTimerRef = useRef(null);
  const dailyHeartLimit = dailyLimits.hearts ?? Number.POSITIVE_INFINITY;
  const dailyKeyLimit = dailyLimits.keys ?? Number.POSITIVE_INFINITY;

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE}/api/quiz-usage-policy?user_id=${encodeURIComponent(userId)}`)
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Could not load usage rewards.')))
      .then(policy => setDailyLimits({
        hearts: policy.hearts,
        keys: policy.keys,
        unlimited: policy.unlimited,
      }))
      .catch(error => console.warn('Could not load quiz usage rewards:', error));
  }, [userId]);

  const consumeDailyUsage = (resource) => {
    const current = readDailyUsage();
    const limit = resource === 'hearts' ? dailyHeartLimit : dailyKeyLimit;
    if (current[resource] >= limit) return false;

    const next = { ...current, [resource]: current[resource] + 1 };
    localStorage.setItem(DAILY_USAGE_STORAGE_KEY, JSON.stringify({
      date: getTodayKey(),
      ...next,
    }));
    window.dispatchEvent(new Event('cramzero-quiz-usage-updated'));
    setDailyUsage(next);
    return true;
  };

  useEffect(() => {
    if (!safeDeck.cards || safeDeck.cards.length === 0) return;

    const count = examConfig?.count || 10;
    const isMock = examConfig?.isMock || false;
    const timeMode = examConfig?.timeMode || 'No Limit';
    const qType = examConfig?.questionType || 'mc'; // 'mc', 'tf', 'mixed'
    const isRandom = examConfig?.isRandom !== false;

    let pool = [...safeDeck.cards];
    if (isRandom) {
      pool = pool.sort(() => Math.random() - 0.5);
    }
    let selectedCards = pool.slice(0, Math.min(count, pool.length));

    const generatedQs = selectedCards.map((card, idx) => {
      // Determine question type for this specific item
      let currentType = qType;
      if (qType === 'mixed') {
        currentType = idx % 2 === 0 ? 'mc' : 'tf';
      }

      const otherCards = safeDeck.cards.filter(c => c.term !== card.term);
      const shuffledOthers = [...otherCards].sort(() => Math.random() - 0.5);

      if (currentType === 'tf') {
        // True / False Generation: 50% chance True, 50% chance False
        const isTrue = Math.random() >= 0.5 || shuffledOthers.length === 0;

        if (isTrue) {
          return {
            type: 'tf',
            scenario: isMock ? "Verification Analysis" : "True / False Check",
            question: isMock
              ? `Evaluate the validity: "${card.term}" is defined as "${card.definition}".`
              : `True or False: "${card.term}" refers to "${card.definition}".`,
            statementTerm: card.term,
            statementDef: card.definition,
            options: ['True', 'False'],
            answer: 'True',
            explanation: `Accurate. "${card.term}" correctly corresponds to: "${card.definition}".`,
            hint: `Check whether the definition matches "${card.term}" exactly.`
          };
        } else {
          const impostor = shuffledOthers[0];
          return {
            type: 'tf',
            scenario: isMock ? "Verification Analysis" : "True / False Check",
            question: isMock
              ? `Evaluate the validity: "${card.term}" is defined as "${impostor.definition}".`
              : `True or False: "${card.term}" refers to "${impostor.definition}".`,
            statementTerm: card.term,
            statementDef: impostor.definition,
            realTerm: impostor.term,
            actualDef: card.definition,
            options: ['True', 'False'],
            answer: 'False',
            explanation: `False. That statement describes "${impostor.term}". "${card.term}" actually refers to: "${card.definition}".`,
            hint: `Compare the statement with the concept it describes, not just the familiar words.`
          };
        }
      } else {
        // Multiple Choice Generation
        let distractors = shuffledOthers.slice(0, 3).map(c => c.definition);
        let fallbackIdx = 1;
        while (distractors.length < 3) {
          distractors.push(`Alternative contextual definition #${fallbackIdx++}`);
        }
        
        const options = [card.definition, ...distractors].sort(() => Math.random() - 0.5);

        return {
          type: 'mc',
          scenario: isMock ? "Scenario Analysis" : "Knowledge Check",
          question: isMock
            ? `Analyze the following concept: "${card.term}". Which of the following statements best defines its core operational mechanism or definition?`
            : `What is the definition of "${card.term}"?`,
          options: options,
          answer: card.definition,
          explanation: `The accurate definition of "${card.term}" is "${card.definition}".`,
          hint: `Look for the option that most directly explains "${card.term}", rather than a related idea.`
        };
      }
    });

    setQuestions(generatedQs);
    setCurrentIndex(0);
    setAnswers({});
    setEliminatedOptions({});
    setAttempts({});
    setMissedQuestions([]);
    setFeedbackState({});
    setHintVisible({});
    setExplanationVisible({});
    setIsFinished(false);
    setHearts(SESSION_HEART_LIMIT);
    setHintKeys(SESSION_KEY_LIMIT);
    setDailyUsage(readDailyUsage());
    setXpFeedback(null);
    setPerfectStreak(0);
    setSuccessOverlay(null);
    setSessionEndReason('');
    ensureSfxEnabledByDefault();
    initAudio();
    setIsSoundMuted(isSfxMuted());
    playSfxSequence([
      { name: 'quiz_start', options: { volume: 0.7 } },
      { name: 'countdown_go', delay: 150, options: { volume: 0.45 } },
    ]);
    timerCuesPlayedRef.current.clear();
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (successOverlayTimerRef.current) {
      clearTimeout(successOverlayTimerRef.current);
      successOverlayTimerRef.current = null;
    }

    if (timeMode !== 'No Limit') {
      const mins = parseInt(timeMode.split(' ')[0], 10);
      setTimeLeftSeconds(mins * 60);
    } else {
      setTimeLeftSeconds(null);
    }
  }, [safeDeck.cards, examConfig?.count, examConfig?.isMock, examConfig?.timeMode, examConfig?.questionType, examConfig?.isRandom]);

  useEffect(() => () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    if (successOverlayTimerRef.current) clearTimeout(successOverlayTimerRef.current);
  }, []);

  useEffect(() => {
    if (timeLeftSeconds === null || isFinished) return;
    
    if (timeLeftSeconds <= 0) {
      playSfx('timer_expired', { volume: 0.7 });
      setIsFinished(true);
      return;
    }

    const timerCue = {
      10: 'timer_warning',
      5: 'timer_warning',
      3: 'countdown_3',
      2: 'countdown_2',
      1: 'countdown_1',
    }[timeLeftSeconds];

    if (timerCue && !timerCuesPlayedRef.current.has(timeLeftSeconds)) {
      timerCuesPlayedRef.current.add(timeLeftSeconds);
      playSfx(timerCue, { volume: 0.55 });
    }

    const timerId = setInterval(() => {
      setTimeLeftSeconds(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeftSeconds, isFinished]); 

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelect = (opt) => {
    if (answers[currentIndex] !== undefined || isFinished || eliminatedOptions[currentIndex]?.includes(opt)) return;
    initAudio();
    const isCorrect = opt === questions[currentIndex]?.answer;
    if (!isCorrect && readDailyUsage().hearts >= dailyHeartLimit) {
      toast.warning('Daily hearts used', {
        description: 'You have used all 30 heart uses for today. Try again tomorrow.',
      });
      addInAppNotification({ type: 'limit', message: 'Daily heart limit reached', description: 'You used all 30 heart uses for today.' });
      setSessionEndReason('You reached today’s limit of 30 heart uses. Come back tomorrow to keep learning.');
      setIsFinished(true);
      return;
    }
    const isPerfectAnswer = isCorrect
      && (attempts[currentIndex] || 0) === 0
      && !hintVisible[currentIndex]
      && feedbackState[currentIndex] !== 'wrong';
    playSfx('answer_locked', { volume: 0.35 });
    playSfx(isCorrect ? 'answer_correct' : 'answer_incorrect', { volume: 0.65 });
    setAttempts(prev => ({ ...prev, [currentIndex]: (prev[currentIndex] || 0) + 1 }));
    setFeedbackState(prev => ({ ...prev, [currentIndex]: isCorrect ? 'correct' : 'wrong' }));
    if (isCorrect) {
    setMissedQuestions(prev => prev.filter(index => index !== currentIndex));
    } else {
    setMissedQuestions(prev => prev.includes(currentIndex) ? prev : [...prev, currentIndex]);
    }
    setXpFeedback({ amount: isCorrect ? 10 : 0, key: `${currentIndex}-${Date.now()}` });
    window.setTimeout(() => setXpFeedback(null), 1200);
    if (isCorrect) {
      if (isPerfectAnswer) {
        const nextStreak = perfectStreak + 1;
        setPerfectStreak(nextStreak);
        setSuccessOverlay({ streak: nextStreak, key: `${currentIndex}-${Date.now()}` });
        if (successOverlayTimerRef.current) clearTimeout(successOverlayTimerRef.current);
        successOverlayTimerRef.current = window.setTimeout(() => {
          setSuccessOverlay(null);
          successOverlayTimerRef.current = null;
        }, 1700);
      }
      toast.success('Correct answer!', {
        description: isPerfectAnswer ? 'Perfect! No hint or mistake used. +10 XP.' : '+10 XP earned.',
        duration: 1800,
      });
      addInAppNotification({
        type: isPerfectAnswer ? 'perfect' : 'correct',
        message: isPerfectAnswer ? 'Perfect answer streak' : 'Correct answer',
        description: isPerfectAnswer ? `You answered perfectly with a ${perfectStreak + 1}-answer streak.` : '+10 XP earned.',
      });
      if (userId) {
        fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/quiz-xp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: `quiz-${userId}-${Date.now()}-${currentIndex}`,
            amount: 10,
            source: examConfig?.isMock ? 'mock-exam' : 'quiz',
          }),
        }).catch(error => console.warn('Could not sync quiz XP:', error));
      }
      playSfxSequence([
        { name: 'answer_correct', options: { volume: 0.7 } },
        { name: 'quiz_next', delay: 180, options: { volume: 0.45 } },
      ]);
      setAnswers(prev => ({ ...prev, [currentIndex]: opt }));
      autoAdvanceTimerRef.current = setTimeout(() => {
        setCurrentIndex(index => {
          if (index >= questions.length - 1) {
            const remainingMissed = missedQuestions.filter(questionIndex => questionIndex !== index);
            if (remainingMissed.length > 0) return remainingMissed[0];
            setIsFinished(true);
            return index;
          }
          return index + 1;
        });
        autoAdvanceTimerRef.current = null;
      }, 3000);
    } else {
      if (!consumeDailyUsage('hearts')) {
        toast.warning('Daily hearts used', {
          description: 'You have used all 30 heart uses for today. Try again tomorrow.',
        });
        addInAppNotification({ type: 'limit', message: 'Daily heart limit reached', description: 'You used all 30 heart uses for today.' });
        setSessionEndReason('You reached today’s limit of 30 heart uses. Come back tomorrow to keep learning.');
        setIsFinished(true);
        return;
      }
      setPerfectStreak(0);
      toast.error('Heart lost', {
        description: `${Math.max(hearts - 1, 0)} session hearts remaining.`,
        duration: 1800,
      });
      addInAppNotification({ type: 'heart', message: 'Heart lost', description: `${Math.max(hearts - 1, 0)} session hearts remaining.` });
      playSfx('heart_lost', { volume: 0.7 });
      const remainingHearts = hearts - 1;
      setHearts(remainingHearts);
      setEliminatedOptions(prev => ({
        ...prev,
        [currentIndex]: [...(prev[currentIndex] || []), opt],
      }));
      if (remainingHearts <= 0) {
        playSfx('quiz_hearts_empty', { volume: 0.85 });
        setSessionEndReason(`You used all ${SESSION_HEART_LIMIT} session hearts. Review the explanations and try the session again.`);
        setIsFinished(true);
      }
    }
    recordAnalyticsEvent({
      type: 'quiz_answer',
      deckId: safeDeck.id || 'unknown-deck',
      deckTitle: safeDeck.title || 'Untitled deck',
      term: questions[currentIndex]?.question || `Question ${currentIndex + 1}`,
      correct: isCorrect,
      mode: examConfig?.isMock ? 'mock-exam' : 'quiz',
    });
  };

  const handleHint = () => {
    if (answeredCurrent || isFinished || hintKeys <= 0 || dailyUsage.keys >= dailyKeyLimit) {
      if (dailyUsage.keys >= dailyKeyLimit) {
        toast.warning('Daily hint keys used', {
          description: 'You have used all 30 hint-key uses for today. Try again tomorrow.',
        });
        addInAppNotification({ type: 'limit', message: 'Daily hint-key limit reached', description: 'You used all 30 hint-key uses for today.' });
      }
      return;
    }
    const currentOptions = questions[currentIndex]?.options || [];
    const removableOption = currentOptions.find(
      option => option !== questions[currentIndex]?.answer && !eliminatedOptions[currentIndex]?.includes(option)
    );
    if (!removableOption) return;
    setEliminatedOptions(prev => ({
      ...prev,
      [currentIndex]: [...(prev[currentIndex] || []), removableOption],
    }));
    setHintVisible(prev => ({ ...prev, [currentIndex]: true }));
    setFeedbackState(prev => ({ ...prev, [currentIndex]: 'hint' }));
    setHintKeys(keys => keys - 1);
    consumeDailyUsage('keys');
    toast.info('Hint used', {
      description: `${hintKeys - 1} session hint keys remaining.`,
      duration: 1600,
    });
    addInAppNotification({ type: 'hint', message: 'Hint used', description: `${hintKeys - 1} session hint keys remaining.` });
    setPerfectStreak(0);
    playSfx('hint_used', { volume: 0.65 });
    setXpFeedback({ amount: 0, label: '−1 key', key: `hint-${Date.now()}` });
    window.setTimeout(() => setXpFeedback(null), 1200);
  };

  const handleReveal = () => {
    if (answeredCurrent || isFinished || hintKeys <= 0 || dailyUsage.keys >= dailyKeyLimit) {
      if (dailyUsage.keys >= dailyKeyLimit) {
        toast.warning('Daily hint keys used', {
          description: 'You have used all 30 hint-key uses for today. Try again tomorrow.',
        });
        addInAppNotification({ type: 'limit', message: 'Daily hint-key limit reached', description: 'You used all 30 hint-key uses for today.' });
      }
      return;
    }
    const currentQuestion = questions[currentIndex];
    const distractors = (currentQuestion?.options || []).filter(option => option !== currentQuestion.answer);
    setEliminatedOptions(prev => ({ ...prev, [currentIndex]: distractors }));
    setHintVisible(prev => ({ ...prev, [currentIndex]: true }));
    setFeedbackState(prev => ({ ...prev, [currentIndex]: 'hint' }));
    setHintKeys(keys => keys - 1);
    consumeDailyUsage('keys');
    toast.info('Answer revealed', {
      description: `${hintKeys - 1} session hint keys remaining.`,
      duration: 1600,
    });
    addInAppNotification({ type: 'hint', message: 'Answer revealed', description: `${hintKeys - 1} session hint keys remaining.` });
    setPerfectStreak(0);
    playSfx('hint_used', { volume: 0.65 });
    setXpFeedback({ amount: 0, label: '−1 key', key: `reveal-${Date.now()}` });
    window.setTimeout(() => setXpFeedback(null), 1200);
  };

  const handleExplain = () => {
    if (isFinished) return;
    playSfx('explanation_open', { volume: 0.55 });
    setExplanationVisible(prev => ({ ...prev, [currentIndex]: true }));
    if (!answeredCurrent && feedbackState[currentIndex] === 'wrong') {
      autoAdvanceTimerRef.current = setTimeout(() => {
        setCurrentIndex(index => {
          if (index >= questions.length - 1) {
            if (missedQuestions.length > 0) return missedQuestions[0];
            playSfxSequence([
              { name: 'quiz_complete', options: { volume: 0.8 } },
              { name: 'match_victory', delay: 180, options: { volume: 0.45 } },
            ]);
            setIsFinished(true);
            return index;
          }
          return index + 1;
        });
        autoAdvanceTimerRef.current = null;
      }, 3000);
    }
  };

  const handleNext = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (!answeredCurrent && feedbackState[currentIndex] === 'wrong' && !explanationVisible[currentIndex]) return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (missedQuestions.length > 0) {
      setCurrentIndex(missedQuestions[0]);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setCurrentIndex(0);
    setAnswers({});
    setEliminatedOptions({});
    setAttempts({});
    setMissedQuestions([]);
    setFeedbackState({});
    setHintVisible({});
    setExplanationVisible({});
    setIsFinished(false);
    setHearts(SESSION_HEART_LIMIT);
    setHintKeys(SESSION_KEY_LIMIT);
    setDailyUsage(readDailyUsage());
    setPerfectStreak(0);
    setSuccessOverlay(null);
    setSessionEndReason('');
    setXpFeedback(null);
    timerCuesPlayedRef.current.clear();
    if (examConfig?.timeMode && examConfig?.timeMode !== 'No Limit') {
      const mins = parseInt(examConfig.timeMode.split(' ')[0], 10);
      setTimeLeftSeconds(mins * 60);
    }
  };

  const handleToggleSound = () => {
    initAudio();
    setIsSoundMuted(toggleSfxMute());
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-auto p-8 text-center">
        <Card className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 shadow-sm">
          <p className="text-stone-500 dark:text-zinc-400 mb-6 font-medium">Cannot generate test. The deck is empty or has no terms.</p>
          <Button onClick={() => navigateTo('deck-details')} className="bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full px-6 h-11">
            <ArrowLeft size={16} className="mr-2" /> Return to Deck
          </Button>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // COMPLETED SCREEN (REVIEW & SCORE)
  // ---------------------------------------------------------------------------
  if (isFinished) {
    let finalScore = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) finalScore++;
    });
    
    const percentage = Math.round((finalScore / questions.length) * 100);
    const feedback = percentage >= 80 ? "Outstanding Mastery!" : percentage >= 60 ? "Good Effort!" : "Keep Reviewing!";

    return (
      <div className="w-full max-w-3xl mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 flex flex-col animate-in fade-in duration-300">
        <Card className="p-5 sm:p-7 md:p-12 text-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-stone-200/90 dark:border-zinc-800 shadow-xl rounded-3xl mb-5 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-5 md:mb-6 shadow-sm border border-emerald-500/20">
            <CheckCircle size={32} className="sm:hidden" />
            <CheckCircle size={40} className="hidden sm:block" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 dark:text-zinc-100 mb-1 sm:mb-2">
            Assessment Complete
          </h2>
          <p className="text-stone-500 dark:text-zinc-400 font-medium text-base sm:text-lg mb-4 sm:mb-6 md:mb-8">{feedback}</p>
          {sessionEndReason && (
            <div className="mx-auto mb-5 max-w-lg rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300">
              {sessionEndReason}
            </div>
          )}
          
          <div className="bg-stone-50/80 dark:bg-zinc-950 border border-stone-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 md:mb-8 max-w-xs mx-auto shadow-inner">
            <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Final Score</p>
            <div className="flex items-baseline justify-center gap-2 text-stone-900 dark:text-zinc-100">
              <span className="text-5xl sm:text-6xl font-black tracking-tight">{finalScore}</span>
              <span className="text-xl sm:text-2xl font-bold text-stone-400 dark:text-zinc-600">/ {questions.length}</span>
            </div>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-2">{percentage}% Accuracy</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center max-w-md mx-auto">
            <Button
              variant="outline"
              onClick={handleRestart}
              className="h-10 sm:h-12 px-5 sm:px-6 rounded-full font-bold text-stone-700 dark:text-zinc-300 border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-800"
            >
              <RotateCcw size={16} className="mr-2" /> Retake Test
            </Button>
            <Button
              onClick={() => navigateTo('deck-details')}
              className="bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-stone-800 dark:hover:bg-zinc-200 font-bold rounded-full h-10 sm:h-12 px-6 sm:px-8 shadow-md"
            >
              Return to Deck
            </Button>
          </div>
        </Card>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl text-stone-900 dark:text-zinc-100 px-2 flex items-center gap-2">
            <Layers size={20} className="text-amber-500" />
            Detailed Question Review
          </h3>

          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.answer;
            const isSkipped = answers[i] === undefined;

            return (
              <Card
                key={i}
                className={`p-5 md:p-6 rounded-2xl bg-white dark:bg-zinc-900 border-l-4 shadow-sm ${
                  isCorrect
                    ? 'border-l-emerald-500 border-stone-200/80 dark:border-zinc-800'
                    : 'border-l-rose-500 border-stone-200/80 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0">
                    {isCorrect ? (
                      <CheckCircle size={22} className="text-emerald-500" />
                    ) : (
                      <X size={22} className="text-rose-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold text-stone-400 dark:text-zinc-500">Question {i + 1}</span>
                      <Badge variant="outline" className="text-[10px] font-bold rounded-full py-0">
                        {q.type === 'tf' ? 'True / False' : 'Multiple Choice'}
                      </Badge>
                    </div>

                    <p className="font-bold text-stone-900 dark:text-zinc-100 mb-3 text-sm md:text-base leading-relaxed">
                      {q.question}
                    </p>

                    <div className="space-y-2 text-xs md:text-sm bg-stone-50/80 dark:bg-zinc-950 p-4 rounded-xl border border-stone-200/80 dark:border-zinc-800/80">
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 font-medium text-stone-500 dark:text-zinc-400">Your Answer:</span>
                        <span className={`font-semibold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {isSkipped ? 'Skipped' : answers[i]}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="flex items-start gap-2 pt-2 border-t border-stone-200/60 dark:border-zinc-800/60">
                          <span className="shrink-0 font-medium text-stone-500 dark:text-zinc-400">Correct Answer:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{q.answer}</span>
                        </div>
                      )}
                      {q.explanation && (
                        <p className="pt-2 text-xs text-stone-500 dark:text-zinc-400 border-t border-stone-200/60 dark:border-zinc-800/60 leading-relaxed italic">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // ACTIVE QUESTION VIEW (CENTERED, NON-OVERLAPPING)
  // ---------------------------------------------------------------------------
  const currentQ = questions[currentIndex];
  const answeredCurrent = answers[currentIndex] !== undefined;
  const masteredCount = Object.keys(answers).length;

  return (
  <div className="min-h-full w-full bg-slate-50/80 dark:bg-zinc-950">
    {successOverlay && (
      <div
        key={successOverlay.key}
        className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center px-5 animate-in fade-in duration-200"
        role="status"
        aria-live="polite"
      >
        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-300/70 bg-white/95 px-8 py-7 text-center shadow-2xl shadow-emerald-900/20 backdrop-blur-xl dark:border-emerald-500/30 dark:bg-zinc-900/95">
          <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-emerald-300/30 blur-2xl dark:bg-emerald-500/20" />
          <div className="absolute -bottom-10 -right-6 h-28 w-28 rounded-full bg-amber-300/30 blur-2xl dark:bg-amber-500/20" />
          <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-500/10 dark:bg-emerald-950/70 dark:text-emerald-400">
            {successOverlay.streak > 1 ? <Flame size={32} fill="currentColor" /> : <Sparkles size={32} />}
          </div>
          <p className="relative text-2xl font-black tracking-tight text-stone-900 dark:text-zinc-100">
            {successOverlay.streak > 1 ? 'Perfect streak!' : 'Perfect answer!'}
          </p>
          <p className="relative mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            +10 XP · no hints or mistakes
          </p>
          {successOverlay.streak > 1 && (
            <div className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Flame size={14} fill="currentColor" />
              {successOverlay.streak} in a row
            </div>
          )}
        </div>
      </div>
    )}
    <div className="mx-auto flex w-full max-w-4xl flex-col px-3 pb-8 pt-2 sm:px-6 sm:pb-8 md:pt-3 animate-in fade-in duration-300">
      
    {/* Gizmo-style session header */}
    <div className="flex shrink-0 items-center gap-3 border-b border-slate-200/80 pb-2 dark:border-zinc-800">
      <Button variant="ghost" size="icon" onClick={() => setIsFinished(true)} className="rounded-full text-slate-700 hover:bg-slate-200 dark:text-zinc-200 dark:hover:bg-zinc-800" aria-label="Exit test">
        <X size={21} />
      </Button>
      <div className="min-w-0 flex-1 text-center">
        <p className="truncate text-sm font-black text-slate-800 dark:text-zinc-100">{safeDeck.title}</p>
        <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">{examConfig?.isMock ? 'Mock test' : 'Knowledge check'}</p>
      </div>
      <div className="flex items-center gap-1">
        {timeLeftSeconds !== null && (
          <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs font-bold ${
              timeLeftSeconds < 60
                ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 animate-pulse'
                : 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800'
            }`}>
              <Timer size={15} />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleSound}
            className="rounded-full text-stone-500 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400"
            title={isSoundMuted ? 'Enable sound effects' : 'Mute sound effects'}
            aria-label={isSoundMuted ? 'Enable sound effects' : 'Mute sound effects'}
          >
            {isSoundMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFinished(true)}
            className="hidden rounded-full text-stone-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold text-xs h-9 px-3 sm:flex"
            title="End test"
          >
            End
          </Button>
        </div>
      </div>

      <div className="mt-2 flex shrink-0 items-center gap-2">
        <button type="button" onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0} className="rounded-full bg-white p-2.5 text-slate-600 shadow-sm ring-1 ring-slate-200 disabled:opacity-40 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800" aria-label="Previous question"><ChevronLeft size={18} /></button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-sky-500 transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + (answeredCurrent ? 1 : 0)) / questions.length) * 100}%` }}
        />
        </div>
        <button type="button" onClick={handleNext} disabled={!answeredCurrent && !(feedbackState[currentIndex] === 'wrong' && explanationVisible[currentIndex])} className="rounded-full bg-white p-2.5 text-slate-600 shadow-sm ring-1 ring-slate-200 disabled:opacity-40 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800" aria-label="Next question"><ChevronRight size={18} /></button>
      </div>

      <div className="mx-auto mt-2 flex w-full max-w-md items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        <span className="text-sky-600">{masteredCount} mastered</span><span className="text-slate-300">•</span><span>{Object.values(attempts).reduce((sum, count) => sum + count, 0)} attempts</span><span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">+{masteredCount * 10} XP</span>
      </div>
      <div className="mx-auto mt-2 flex items-center justify-center gap-3 text-xs font-black">
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300" aria-label={`${hearts} session hearts remaining; ${dailyLimits.unlimited ? 'unlimited' : `${dailyHeartLimit - dailyUsage.hearts} daily heart uses remaining`}`}>
          <Heart size={14} fill="currentColor" /> {hearts}/{SESSION_HEART_LIMIT}
          <span className="ml-1 text-[10px] opacity-70">{dailyLimits.unlimited ? 'unlimited today' : `today ${dailyUsage.hearts}/${dailyHeartLimit}`}</span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" aria-label={`${hintKeys} session hint keys remaining; ${dailyLimits.unlimited ? 'unlimited' : `${dailyKeyLimit - dailyUsage.keys} daily key uses remaining`}`}>
          <KeyRound size={14} /> {hintKeys}/{SESSION_KEY_LIMIT}
          <span className="ml-1 text-[10px] opacity-70">{dailyLimits.unlimited ? 'unlimited today' : `today ${dailyUsage.keys}/${dailyKeyLimit}`}</span>
        </span>
        {xpFeedback && <span key={xpFeedback.key} className="animate-in fade-in slide-in-from-bottom-1 text-emerald-600 dark:text-emerald-400">{xpFeedback.label || `+${xpFeedback.amount} XP`}</span>}
      </div>

      {/* Question Card Container */}
      <Card className="mx-auto mt-3 w-full max-w-3xl rounded-[1.5rem] border-2 border-sky-500/90 bg-white p-4 shadow-[0_12px_35px_rgb(14_165_233/0.10)] dark:bg-zinc-900 sm:p-5 md:p-6">
        {/* Meta badges */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge className="bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-0 rounded-full text-[11px] font-bold tracking-wide px-3 py-1">
            {answeredCurrent ? '✓ Mastered' : currentQ.scenario || 'Concept Verification'}
          </Badge>
          {currentQ.type === 'tf' ? (
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-[10px] font-bold rounded-full">
              True / False
            </Badge>
          ) : (
            <Badge variant="outline" className="border-stone-300 dark:border-zinc-700 text-stone-500 dark:text-zinc-400 text-[10px] font-bold rounded-full">
              Multiple Choice
            </Badge>
          )}
        </div>

        {/* Question Text */}
        <h3 className="mb-3 text-base font-bold leading-snug text-stone-900 dark:text-zinc-100 sm:text-lg md:text-xl">
          {currentQ.question}
        </h3>

        {/* TRUE / FALSE DUAL HERO BUTTONS */}
        {currentQ.type === 'tf' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
            {/* TRUE BUTTON */}
            {(() => {
              const opt = 'True';
              const isEliminated = eliminatedOptions[currentIndex]?.includes(opt);
              const isCorrect = opt === currentQ.answer;
              const showCorrect = answeredCurrent && isCorrect;
              const showIncorrect = isEliminated;

              let btnStyle = "border-stone-200/90 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-950/50 hover:border-emerald-500/60 hover:bg-emerald-50/20 dark:hover:border-emerald-500/60";
              let badgeStyle = "bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400";

              if (showCorrect) {
                btnStyle = "border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/20";
                badgeStyle = "bg-emerald-500 text-white";
              } else if (showIncorrect) {
                btnStyle = "border-rose-500 bg-rose-50/90 dark:bg-rose-950/40 shadow-sm ring-2 ring-rose-500/20";
                badgeStyle = "bg-rose-500 text-white";
              } else if (answeredCurrent || isEliminated) {
                btnStyle = "opacity-50 border-stone-200/50 dark:border-zinc-800/50";
              }

              return (
                <button
                  disabled={answeredCurrent || isEliminated}
                  onClick={() => handleSelect(opt)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-36 ${btnStyle}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Statement Affirmation</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${badgeStyle}`}>
                      <Check size={16} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-stone-900 dark:text-zinc-100">True</h4>
                    <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">This statement is factually accurate</p>
                  </div>
                </button>
              );
            })()}

            {/* FALSE BUTTON */}
            {(() => {
              const opt = 'False';
              const isEliminated = eliminatedOptions[currentIndex]?.includes(opt);
              const isCorrect = opt === currentQ.answer;
              const showCorrect = answeredCurrent && isCorrect;
              const showIncorrect = isEliminated;

              let btnStyle = "border-stone-200/90 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-950/50 hover:border-rose-500/60 hover:bg-rose-50/20 dark:hover:border-rose-500/60";
              let badgeStyle = "bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400";

              if (showCorrect) {
                btnStyle = "border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/20";
                badgeStyle = "bg-emerald-500 text-white";
              } else if (showIncorrect) {
                btnStyle = "border-rose-500 bg-rose-50/90 dark:bg-rose-950/40 shadow-sm ring-2 ring-rose-500/20";
                badgeStyle = "bg-rose-500 text-white";
              } else if (answeredCurrent) {
                btnStyle = "opacity-50 border-stone-200/50 dark:border-zinc-800/50";
              }

              return (
                <button
                  disabled={answeredCurrent || isEliminated}
                  onClick={() => handleSelect(opt)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-36 ${btnStyle}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Statement Refutation</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${badgeStyle}`}>
                      <X size={16} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-stone-900 dark:text-zinc-100">False</h4>
                    <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">This statement contains inaccuracies</p>
                  </div>
                </button>
              );
            })()}
          </div>
        ) : (
          /* MULTIPLE CHOICE 4 OPTIONS */
          <div className="my-1 grid gap-2 sm:grid-cols-2">
            {currentQ.options.map((opt, i) => {
              const isEliminated = eliminatedOptions[currentIndex]?.includes(opt);
              const isCorrect = opt === currentQ.answer;
              const showCorrect = answeredCurrent && isCorrect;
              const showIncorrect = isEliminated;

              let bgClass = 'bg-stone-50/50 dark:bg-zinc-950/50 border-stone-200/90 dark:border-zinc-800 hover:bg-stone-100/70 dark:hover:bg-zinc-800/60 text-stone-800 dark:text-zinc-200';
              let circleClass = 'border-stone-300 dark:border-zinc-700 bg-transparent text-stone-500';
              let textClass = 'text-stone-800 dark:text-zinc-200 font-medium';

              if (showCorrect) {
                bgClass = 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 shadow-sm';
                circleClass = 'border-emerald-600 bg-emerald-600 text-white';
                textClass = 'text-emerald-950 dark:text-emerald-300 font-bold';
              } else if (showIncorrect) {
                bgClass = 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-500 dark:border-rose-600 shadow-sm';
                circleClass = 'border-rose-600 bg-rose-600 text-white';
                textClass = 'text-rose-950 dark:text-rose-300 font-bold';
              } else if (answeredCurrent || isEliminated) {
                bgClass = 'bg-stone-50/30 dark:bg-zinc-950/30 border-stone-200/40 dark:border-zinc-800/40 opacity-50';
              }

              const letters = ['A', 'B', 'C', 'D'];

              return (
                <button 
                  key={i} 
                  disabled={answeredCurrent || isEliminated}
                  onClick={() => handleSelect(opt)}
                  className={`w-full min-h-[4.25rem] p-3 md:p-3.5 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 ${bgClass}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors ${circleClass}`}>
                    {showCorrect ? <Check size={14} /> : showIncorrect ? <X size={14} /> : letters[i] || (i + 1)}
                  </div>
                  <p className={`text-xs leading-snug sm:text-sm ${textClass}`}>{opt}</p>
                </button>
              );
            })}
          </div>
        )}

        {!answeredCurrent && (
          <div className="mt-3 space-y-2">
            <div className="flex items-start gap-2.5">
              <Sparkles size={17} className="mt-0.5 shrink-0 text-violet-600 dark:text-violet-400" />
              <div>
                <p className="text-xs font-bold text-violet-900 dark:text-violet-300">
                  {feedbackState[currentIndex] === 'wrong' ? 'That option is ruled out.' : 'Need a nudge?'}
                </p>
                {attempts[currentIndex] > 1 && (
                  <p className="mt-1 text-[11px] text-violet-800/70 dark:text-violet-300/70">
                    Keep going — this concept stays in your session until it clicks.
                  </p>
                )}
                {hintVisible[currentIndex] && (
                  <p className="mt-1 text-xs leading-relaxed text-violet-800/80 dark:text-violet-300/80">{currentQ.hint}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Button type="button" variant="outline" disabled={hintKeys <= 0 || dailyUsage.keys >= dailyKeyLimit} onClick={handleHint} className="h-9 rounded-full border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"><Sparkles size={13} className="mr-1 text-sky-500" />Hint</Button>
              <Button type="button" variant="outline" disabled={hintKeys <= 0 || dailyUsage.keys >= dailyKeyLimit} onClick={handleReveal} className="h-9 rounded-full border-slate-200 bg-white px-2 text-[11px] font-bold text-stone-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"><Target size={13} className="mr-1 text-blue-500" />Reveal</Button>
              <Button type="button" variant="outline" onClick={handleExplain} className="h-9 rounded-full border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"><Sparkles size={13} className="mr-1 text-violet-500" />Explain</Button>
            </div>
          </div>
        )}

        {/* Immediate Explanation Feedback Box when Answered */}
        {(answeredCurrent || explanationVisible[currentIndex]) && currentQ.explanation && (
          <div className={`mt-3 p-3 rounded-xl border text-sm animate-in fade-in duration-200 ${
            'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300/60 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
          }`}>
            <p className="font-semibold flex items-center gap-1.5 mb-1 text-xs sm:text-sm">
              <><CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" /> Correct — here's why</>
            </p>
            <p className="text-xs sm:text-sm leading-relaxed opacity-95">{currentQ.explanation}</p>
          </div>
        )}

        {/* Integrated Navigation Footer (Inside Card: Never overlaps any choice!) */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-200/80 pt-4 dark:border-zinc-800">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(prev => prev - 1)}
            disabled={currentIndex === 0}
            className="h-10 px-4 rounded-xl font-bold text-xs bg-stone-50 dark:bg-zinc-800/60 text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white border-stone-200 dark:border-zinc-700 transition-all disabled:opacity-30"
          >
            <ChevronLeft size={18} className="mr-1.5" /> Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!answeredCurrent && !(feedbackState[currentIndex] === 'wrong' && explanationVisible[currentIndex])}
            className="h-10 px-5 sm:px-7 rounded-xl font-bold text-xs bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-stone-800 dark:hover:bg-zinc-200 shadow-md transition-all disabled:opacity-40"
          >
            {currentIndex === questions.length - 1 ? "Finish Assessment" : feedbackState[currentIndex] === 'wrong' ? "Continue" : "Next Question"}
            <ChevronRight size={18} className="ml-1.5" />
          </Button>
        </div>
      </Card>
    </div>
    </div>
  );
}
