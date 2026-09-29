import { ArrowLeft, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function CodeSpaceView({ navigateTo }) {
  return (
    <div className="min-h-full px-4 py-8 md:px-8 md:py-12 animate-in fade-in duration-300">
      <div className="mx-auto flex min-h-[calc(100vh-13rem)] max-w-4xl items-center justify-center">
        <Card className="w-full overflow-hidden rounded-3xl border-taupe/30 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid md:grid-cols-[1.1fr_0.9fr]">
            <div className="p-7 md:p-12">
              <Badge className="mb-5 gap-2 rounded-full border-none bg-amber-100 px-3 py-1 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
                <Code size={14} /> Coming soon
              </Badge>
              <h2 className="text-3xl font-black tracking-tight text-umber dark:text-zinc-100 md:text-5xl">CodeSpace</h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-taupe dark:text-zinc-400 md:text-lg">
                A focused place to write, run, and understand code while you learn. Zero is preparing an integrated coding workspace for your next study session.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Guided lessons', 'Live practice', 'AI feedback'].map((item) => (
                  <span key={item} className="rounded-full border border-taupe/20 bg-sand/30 px-3 py-1.5 text-xs font-bold text-taupe dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
                    {item}
                  </span>
                ))}
              </div>
              <Button onClick={() => navigateTo('dashboard')} className="mt-8 h-12 rounded-xl bg-umber px-6 font-bold text-sand shadow-md hover:bg-umber/90 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300">
                <ArrowLeft size={17} className="mr-2" /> Back to Dashboard
              </Button>
            </div>
            <div className="relative m-3 flex min-h-64 items-center justify-center overflow-hidden rounded-3xl bg-umber p-5 dark:bg-zinc-950 md:m-5 md:min-h-0 md:p-7">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,219,187,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,219,187,0.3) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
              <div className="relative w-full max-w-xs rounded-3xl border border-sand/20 bg-black/20 p-5 shadow-2xl backdrop-blur-sm animate-in zoom-in-95 duration-500">
                <div className="mb-5 flex items-center gap-2 border-b border-sand/15 pb-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-sand/60">workspace</span>
                </div>
                <div className="space-y-2 font-mono text-xs leading-relaxed text-sand/80">
                  <p><span className="text-amber-300">const</span> lesson = <span className="text-emerald-300">'in progress'</span>;</p>
                  <p><span className="text-amber-300">await</span> zero.prepare(lesson);</p>
                  <p className="text-sand/45">// your coding space is coming</p>
                  <p className="mt-4 text-emerald-300">ready<span className="animate-pulse">_</span></p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
