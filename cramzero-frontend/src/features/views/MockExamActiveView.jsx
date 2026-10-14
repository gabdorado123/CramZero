import { useState, useEffect } from 'react';
import {
  CheckCircle, ChevronLeft, ChevronRight, X,
  Timer, AlertTriangle, Check, Layers, RotateCcw,
  Sparkles, ArrowLeft, Target, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { recordAnalyticsEvent } from '@/lib/analytics';

export function MockExamActiveView({ navigateTo, activeDeck, examConfig }) {
  const safeDeck = activeDeck || { title: "Loading Assessment...", cards: [] }; 
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(null);

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
            explanation: `Accurate. "${card.term}" correctly corresponds to: "${card.definition}".`
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
            explanation: `False. That statement describes "${impostor.term}". "${card.term}" actually refers to: "${card.definition}".`
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
          explanation: `The accurate definition of "${card.term}" is "${card.definition}".`
        };
      }
    });

    setQuestions(generatedQs);
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);

    if (timeMode !== 'No Limit') {
      const mins = parseInt(timeMode.split(' ')[0], 10);
      setTimeLeftSeconds(mins * 60);
    } else {
      setTimeLeftSeconds(null);
    }
  }, [safeDeck.cards, examConfig?.count, examConfig?.isMock, examConfig?.timeMode, examConfig?.questionType, examConfig?.isRandom]);

  useEffect(() => {
    if (timeLeftSeconds === null || isFinished) return;
    
    if (timeLeftSeconds <= 0) {
      setIsFinished(true);
      return;
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
    if (answers[currentIndex] !== undefined || isFinished) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: opt }));
    recordAnalyticsEvent({
      type: 'quiz_answer',
      deckId: safeDeck.id || 'unknown-deck',
      deckTitle: safeDeck.title || 'Untitled deck',
      term: questions[currentIndex]?.question || `Question ${currentIndex + 1}`,
      correct: opt === questions[currentIndex]?.answer,
      mode: examConfig?.isMock ? 'mock-exam' : 'quiz',
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);
    if (examConfig?.timeMode && examConfig?.timeMode !== 'No Limit') {
      const mins = parseInt(examConfig.timeMode.split(' ')[0], 10);
      setTimeLeftSeconds(mins * 60);
    }
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
      <div className="w-full max-w-3xl mx-auto py-8 px-4 flex flex-col animate-in fade-in duration-300">
        <Card className="p-8 md:p-12 text-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-stone-200/90 dark:border-zinc-800 shadow-xl rounded-3xl mb-8">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-500/20">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-stone-900 dark:text-zinc-100 mb-2">
            Assessment Complete
          </h2>
          <p className="text-stone-500 dark:text-zinc-400 font-medium text-lg mb-8">{feedback}</p>
          
          <div className="bg-stone-50/80 dark:bg-zinc-950 border border-stone-200/80 dark:border-zinc-800 rounded-2xl p-6 mb-8 max-w-xs mx-auto shadow-inner">
            <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Final Score</p>
            <div className="flex items-baseline justify-center gap-2 text-stone-900 dark:text-zinc-100">
              <span className="text-6xl font-black tracking-tight">{finalScore}</span>
              <span className="text-2xl font-bold text-stone-400 dark:text-zinc-600">/ {questions.length}</span>
            </div>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-2">{percentage}% Accuracy</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Button
              variant="outline"
              onClick={handleRestart}
              className="h-12 px-6 rounded-full font-bold text-stone-700 dark:text-zinc-300 border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-800"
            >
              <RotateCcw size={16} className="mr-2" /> Retake Test
            </Button>
            <Button
              onClick={() => navigateTo('deck-details')}
              className="bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-stone-800 dark:hover:bg-zinc-200 font-bold rounded-full h-12 px-8 shadow-md"
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

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col my-auto py-6 md:py-10 px-4 sm:px-6 animate-in fade-in duration-300">
      
      {/* Top Header Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-zinc-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-none font-bold text-[11px] rounded-full px-2.5 py-0.5">
              {examConfig?.isMock ? 'Mock Exam' : 'Knowledge Check'}
            </Badge>
            <span className="text-xs font-semibold text-stone-400 dark:text-zinc-500">•</span>
            <span className="text-xs font-bold text-stone-500 dark:text-zinc-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-zinc-100 truncate">
            {safeDeck.title}
          </h2>
        </div>

        {/* Timer and Exit Button */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          {timeLeftSeconds !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono font-bold text-sm border ${
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
            size="sm"
            onClick={() => setIsFinished(true)}
            className="rounded-full text-stone-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold text-xs h-9 px-3"
            title="Quit Exam"
          >
            <X size={15} className="mr-1.5" /> End Test
          </Button>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-stone-200/70 dark:bg-zinc-800 rounded-full h-1.5 mb-6 overflow-hidden">
        <div
          className="bg-amber-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + (answeredCurrent ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card Container */}
      <Card className="rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-stone-200/90 dark:border-zinc-800 transition-all flex flex-col">
        {/* Meta badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge className="bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-full text-[11px] font-bold tracking-wide px-3 py-1">
            {currentQ.scenario || 'Concept Verification'}
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
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-900 dark:text-zinc-100 leading-relaxed mb-6">
          {currentQ.question}
        </h3>

        {/* TRUE / FALSE DUAL HERO BUTTONS */}
        {currentQ.type === 'tf' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
            {/* TRUE BUTTON */}
            {(() => {
              const opt = 'True';
              const isSelected = answers[currentIndex] === opt;
              const isCorrect = opt === currentQ.answer;
              const showCorrect = answeredCurrent && isCorrect;
              const showIncorrect = isSelected && !isCorrect;

              let btnStyle = "border-stone-200/90 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-950/50 hover:border-emerald-500/60 hover:bg-emerald-50/20 dark:hover:border-emerald-500/60";
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
                  disabled={answeredCurrent}
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
              const isSelected = answers[currentIndex] === opt;
              const isCorrect = opt === currentQ.answer;
              const showCorrect = answeredCurrent && isCorrect;
              const showIncorrect = isSelected && !isCorrect;

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
                  disabled={answeredCurrent}
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
          <div className="space-y-3 my-2">
            {currentQ.options.map((opt, i) => {
              const isSelected = answers[currentIndex] === opt;
              const isCorrect = opt === currentQ.answer;
              const showCorrect = answeredCurrent && isCorrect;
              const showIncorrect = isSelected && !isCorrect;

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
              } else if (answeredCurrent) {
                bgClass = 'bg-stone-50/30 dark:bg-zinc-950/30 border-stone-200/40 dark:border-zinc-800/40 opacity-50';
              }

              const letters = ['A', 'B', 'C', 'D'];

              return (
                <button 
                  key={i} 
                  disabled={answeredCurrent}
                  onClick={() => handleSelect(opt)}
                  className={`w-full p-4 md:p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 ${bgClass}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors ${circleClass}`}>
                    {showCorrect ? <Check size={14} /> : showIncorrect ? <X size={14} /> : letters[i] || (i + 1)}
                  </div>
                  <p className={`text-sm md:text-base leading-relaxed ${textClass}`}>{opt}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Immediate Explanation Feedback Box when Answered */}
        {answeredCurrent && currentQ.explanation && (
          <div className={`mt-5 p-4 rounded-2xl border text-sm animate-in fade-in duration-200 ${
            answers[currentIndex] === currentQ.answer
              ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300/60 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
              : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300/60 dark:border-rose-800/60 text-rose-900 dark:text-rose-300'
          }`}>
            <p className="font-semibold flex items-center gap-1.5 mb-1 text-xs sm:text-sm">
              {answers[currentIndex] === currentQ.answer ? (
                <><CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" /> Correct!</>
              ) : (
                <><AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" /> Incorrect</>
              )}
            </p>
            <p className="text-xs sm:text-sm leading-relaxed opacity-95">{currentQ.explanation}</p>
          </div>
        )}

        {/* Integrated Navigation Footer (Inside Card: Never overlaps any choice!) */}
        <div className="mt-8 pt-6 border-t border-stone-200/80 dark:border-zinc-800 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(prev => prev - 1)}
            disabled={currentIndex === 0}
            className="h-12 px-5 sm:px-6 rounded-2xl font-bold text-sm bg-stone-50 dark:bg-zinc-800/60 text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white border-stone-200 dark:border-zinc-700 transition-all disabled:opacity-30"
          >
            <ChevronLeft size={18} className="mr-1.5" /> Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!answeredCurrent}
            className="h-12 px-6 sm:px-8 rounded-2xl font-bold text-sm bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-stone-800 dark:hover:bg-zinc-200 shadow-md transition-all disabled:opacity-40"
          >
            {currentIndex === questions.length - 1 ? "Finish Assessment" : "Next Question"}
            <ChevronRight size={18} className="ml-1.5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
