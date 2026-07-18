import type { HTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { glideTransition } from '@/lib/motion'
import type { MotionSafeProps } from '@/lib/motionTypes'

interface GlassCardProps extends MotionSafeProps<HTMLAttributes<HTMLDivElement>> {
  children: ReactNode
  strong?: boolean
  hoverable?: boolean
}

export function GlassCard({
  children,
  className,
  strong = false,
  hoverable = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4 } : undefined}
      transition={glideTransition}
      className={cn(strong ? 'glass-strong' : 'glass', 'rounded-card', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
