import { useEffect, useLayoutEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Brain, FileText, Sparkles, Users, X } from 'lucide-react';

const TOUR_STORAGE_KEY = 'cramzero-onboarding-v3-complete';

const steps = [
  {
    view: 'dashboard',
    eyebrow: 'Your dashboard',
    title: 'Your study command center.',
    description: 'Start here to see your decks, progress, and the next action for today. Create a deck when your workspace is empty.',
    icon: Sparkles,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
    target: '[data-tour="nav-dashboard"]',
  },
  {
    view: 'study',
    eyebrow: 'Spaced repetition',
    title: 'Build a review habit.',
    description: 'Choose which decks belong in your daily review, then start a focused session using the cards you selected.',
    icon: FileText,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
    target: '[data-tour="study-review"]',
  },
  {
    view: 'decks',
    eyebrow: 'Your library',
    title: 'Keep every deck within reach.',
    description: 'Search, pin, and open your saved decks here. This is the fastest route back to any topic you have generated or imported.',
    icon: Brain,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    target: '[data-tour="deck-library"]',
  },
  {
    view: 'hubs',
    eyebrow: 'Study Hubs',
    title: 'Study with your class.',
    description: 'Create or join a hub, copy its invite link, and collaborate on shared decks with classmates.',
    icon: Users,
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400',
    target: '[data-tour="study-hubs"]',
  },
];

export function OnboardingTour({ currentView, navigateTo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    if (currentView === 'dashboard' && localStorage.getItem(TOUR_STORAGE_KEY) !== 'true') {
      setIsOpen(true);
    }
    if (currentView === 'landing' || !['dashboard', 'study', 'decks', 'hubs'].includes(currentView)) setIsOpen(false);
  }, [currentView]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') finishTour();
      if (event.key === 'ArrowRight') advance();
      if (event.key === 'ArrowLeft') goBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, stepIndex]);

  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    const target = document.querySelector(steps[stepIndex].target);
    if (!target) {
      setTargetRect(null);
      return undefined;
    }

    target.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });
    const updateTargetRect = () => {
      const rect = target.getBoundingClientRect();
      setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    };
    const frameId = window.requestAnimationFrame(updateTargetRect);
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [currentView, isOpen, stepIndex]);

  const finishTour = (returnToDashboard = false) => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsOpen(false);
    if (returnToDashboard && currentView !== 'dashboard') navigateTo('dashboard');
  };

  const advance = () => {
    if (stepIndex === steps.length - 1) {
      finishTour(true);
      return;
    }
    const nextStep = steps[stepIndex + 1];
    if (nextStep.view !== currentView) navigateTo(nextStep.view);
    setStepIndex(currentIndex => currentIndex + 1);
  };

  const goBack = () => {
    if (stepIndex === 0) return;
    const previousStep = steps[stepIndex - 1];
    if (previousStep.view !== currentView) navigateTo(previousStep.view);
    setStepIndex(currentIndex => Math.max(0, currentIndex - 1));
  };

  if (!isOpen) return null;

  const step = steps[stepIndex];
  const StepIcon = step.icon;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const cardWidth = Math.min(520, window.innerWidth - 32);
  const cardHeight = 260;
  const viewportPadding = 20;
  const bottomPadding = 60;
  const calloutPosition = {
    placement: 'above',
    left: isMobile ? 12 : Math.max(viewportPadding, window.innerWidth - cardWidth - viewportPadding),
    top: isMobile ? Math.max(16, window.innerHeight - cardHeight - bottomPadding) : Math.max(viewportPadding, window.innerHeight - cardHeight - bottomPadding),
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[120]" style={{ pointerEvents: 'none' }} role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="absolute inset-0 bg-transparent" />
      {targetRect && <div className="pointer-events-none fixed rounded-2xl border-2 border-amber-400 shadow-[0_0_0_9999px_rgba(33,28,24,0.58)] transition-all duration-300" style={targetRect} />}
      <div className="pointer-events-auto fixed sm:absolute inset-x-3 bottom-5 sm:inset-x-auto sm:bottom-auto w-auto sm:w-[500px] max-w-[calc(100vw-1.5rem)] rounded-3xl border border-stone-200/90 bg-white/98 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950/98 backdrop-blur-2xl" style={isMobile ? undefined : { top: calloutPosition.top, left: calloutPosition.left, pointerEvents: 'auto' }}>
        <div className="flex items-center justify-between border-b border-taupe/15 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-taupe dark:text-zinc-500">
            <span>Quick tour</span>
            <span aria-hidden="true">·</span>
            <span>{stepIndex + 1} of {steps.length}</span>
          </div>
          <button type="button" onClick={finishTour} aria-label="Close onboarding tour" className="rounded-lg p-2 text-taupe transition-colors hover:bg-sand/40 hover:text-umber dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-start gap-4 p-5">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${step.color}`}>
            <StepIcon size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-taupe dark:text-zinc-500">{step.eyebrow}</p>
            <h2 id="onboarding-title" className="text-xl font-black tracking-tight text-umber dark:text-zinc-100 md:text-2xl">{step.title}</h2>
            <p className="mt-1 text-sm leading-5 text-taupe dark:text-zinc-400">{step.description}</p>

            <div className="mt-4 flex gap-1.5" aria-label={`Tour progress: step ${stepIndex + 1} of ${steps.length}`}>
              {steps.map((item, index) => <span key={item.title} className={`h-1.5 flex-1 rounded-full transition-colors ${index <= stepIndex ? 'bg-umber dark:bg-zinc-100' : 'bg-greige/30 dark:bg-zinc-800'}`} />)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-taupe/15 px-5 py-4 dark:border-zinc-800">
          <button type="button" onClick={finishTour} className="text-sm font-bold text-taupe transition-colors hover:text-umber dark:text-zinc-500 dark:hover:text-zinc-100">Skip tour</button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={goBack} disabled={stepIndex === 0} aria-label="Previous tour step" className="rounded-lg border border-taupe/25 p-2.5 text-umber transition-colors hover:bg-sand/30 disabled:cursor-not-allowed disabled:opacity-35 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800">
              <ArrowLeft size={17} />
            </button>
            <button type="button" onClick={advance} className="flex items-center gap-2 rounded-lg bg-umber px-4 py-2.5 text-sm font-bold text-sand transition-colors hover:bg-umber/90 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300">
              {stepIndex === steps.length - 1 ? 'Get started' : 'Next'}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
