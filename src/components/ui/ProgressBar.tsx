import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { clamp } from '@/utils/clamp'

interface ProgressBarProps {
  value: number // 0-100
  className?: string
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const percent = clamp(value, 0, 100)
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-white/10', className)}
    >
      <motion.div
        className="h-full rounded-full bg-white"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
