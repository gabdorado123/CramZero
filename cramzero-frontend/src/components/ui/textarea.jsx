import * as React from "react"
import { cn } from "cn"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-xl border-2 border-sky-100 bg-white/80 px-3 py-2 text-base font-semibold shadow-[inset_0_2px_0_rgb(38_57_77/0.04)] transition-colors outline-none placeholder:text-slate-400 focus-visible:border-sky-400 focus-visible:ring-4 focus-visible:ring-sky-200/60 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50 aria-invalid:border-rose-400 aria-invalid:ring-3 aria-invalid:ring-rose-200 md:text-sm dark:border-sky-900 dark:bg-slate-900/80 dark:text-sky-50 dark:placeholder:text-slate-500",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
