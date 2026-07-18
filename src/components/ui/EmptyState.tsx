import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/motion'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-glass px-8 py-16 text-center',
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-white/6 text-ink-muted">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  )
}
