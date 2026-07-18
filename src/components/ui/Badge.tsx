import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type BadgeTone = 'neutral' | 'success' | 'error' | 'accent'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  tone?: BadgeTone
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-white/8 text-ink-muted border-border-glass',
  success: 'bg-success/15 text-success border-success/25',
  error: 'bg-error/15 text-error border-error/25',
  accent: 'bg-white/12 text-ink border-white/20',
}

export function Badge({ children, tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
