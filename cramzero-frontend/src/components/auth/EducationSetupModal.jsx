import { useState } from 'react';
import { ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';
import { UniversitySelector } from '@/components/education/UniversitySelector';

const LEVELS = ['High school', 'Undergraduate', 'Graduate', 'Professional', 'Lifelong learner'];

export function EducationSetupModal({ userId, onComplete }) {
  const [level, setLevel] = useState('');
  const [university, setUniversity] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isChoosingLevel, setIsChoosingLevel] = useState(true);

  const chooseLevel = (nextLevel) => {
    setLevel(nextLevel);
    if (nextLevel !== 'Undergraduate') setUniversity('');
    setIsChoosingLevel(false);
  };

  const goBackToLevelPicker = () => {
    setIsChoosingLevel(true);
    setUniversity('');
  };

  const save = async (event) => {
    event.preventDefault();
    const requiresUniversity = level === 'Undergraduate';
    if (!level || (requiresUniversity && !university)) {
      toast.error(requiresUniversity ? 'Choose your level and a university from the list.' : 'Choose your education level.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, education_level: level, university: requiresUniversity ? university : null }),
      });
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.detail || 'Could not save education details.');
      localStorage.setItem('cramzero-education-level', updated.education_level || level);
      if (updated.university) localStorage.setItem('cramzero-university', updated.university);
      else localStorage.removeItem('cramzero-university');
      localStorage.removeItem('cramzero-education-skipped');
      localStorage.removeItem(`cramzero-education-skipped-${userId}`);
      onComplete(updated);
    } catch (error) {
      toast.error('Could not save education details', { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-stone-950/55 p-4 backdrop-blur-md dark:bg-black/70">
      <Card className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overflow-x-hidden rounded-[2rem] border-0 bg-white shadow-2xl dark:bg-zinc-900">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white sm:p-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"><GraduationCap size={28} /></div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-100">Make Community yours</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Where are you learning?</h2>
          <p className="mt-2 text-sm leading-relaxed text-violet-100">Choose your level and university to find classmates, share decks, and join your campus leaderboard.</p>
        </div>
        <form onSubmit={save} className="space-y-5 p-6 sm:p-8">
          <div>
            {isChoosingLevel ? (
              <>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Your level</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {LEVELS.map(item => <button key={item} type="button" onClick={() => chooseLevel(item)} className="rounded-xl border border-stone-200 px-3 py-3 text-left text-xs font-bold text-stone-600 transition hover:border-violet-300 dark:border-zinc-800 dark:text-zinc-300">{item}</button>)}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50 px-3 py-3 dark:border-violet-900/70 dark:bg-violet-950/30">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">Your level</p>
                  <p className="truncate text-sm font-bold text-violet-800 dark:text-violet-200">{level}</p>
                </div>
                <button type="button" onClick={goBackToLevelPicker} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100 dark:text-violet-300 dark:hover:bg-violet-900/50">
                  <ArrowLeft size={14} /> Back
                </button>
              </div>
            )}
          </div>
          {level === 'Undergraduate' && <div>
            <label htmlFor="education-university" className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Philippine university</label>
            <UniversitySelector id="education-university" value={university} onChange={setUniversity} />
          </div>}
          <Button type="submit" disabled={isSaving} className="h-12 w-full rounded-xl bg-violet-600 font-bold text-white hover:bg-violet-700">{isSaving ? 'Saving...' : 'Join my university community'} <ArrowRight size={16} className="ml-2" /></Button>
          <button type="button" onClick={() => onComplete(null)} className="w-full text-center text-xs font-semibold text-stone-400 hover:text-stone-700 dark:text-zinc-500 dark:hover:text-zinc-300">Skip for now</button>
        </form>
      </Card>
    </div>
  );
}
