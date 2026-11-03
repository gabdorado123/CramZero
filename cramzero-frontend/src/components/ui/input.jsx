import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border-2 border-sky-100 bg-white/80 px-3 py-1 text-base font-semibold shadow-[inset_0_2px_0_rgb(38_57_77/0.04)] transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-slate-400 focus-visible:border-sky-400 focus-visible:ring-4 focus-visible:ring-sky-200/60 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50 aria-invalid:border-rose-400 aria-invalid:ring-3 aria-invalid:ring-rose-200 md:text-sm dark:border-sky-900 dark:bg-slate-900/80 dark:text-sky-50 dark:placeholder:text-slate-500 dark:focus-visible:border-sky-500 dark:focus-visible:ring-sky-900/60",
        className
      )}
      {...props}
    />
  )
}

export { Input }
