import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { snapTransition } from '@/lib/motion'
import type { MotionSafeProps } from '@/lib/motionTypes'
import type { ButtonVariant } from '@/components/ui/Button'

interface IconButtonProps extends MotionSafeProps<ButtonHTMLAttributes<HTMLButtonElement>> {
  icon: ReactNode
  label: string
  variant?: Extract<ButtonVariant, 'secondary' | 'ghost'>
  active?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, label, variant = 'ghost', active = false, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        whileHover={disabled ? undefined : { scale: 1.05 }}
        whileTap={disabled ? undefined : { scale: 0.93 }}
        transition={snapTransition}
        disabled={disabled}
        className={cn(
          'focus-ring inline-flex size-9 items-center justify-center rounded-[12px] text-ink-muted transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40',
          variant === 'ghost' && 'hover:bg-white/5 hover:text-ink',
          variant === 'secondary' && 'glass hover:bg-glass-strong hover:text-ink',
          active && 'bg-white/10 text-ink',
          className,
        )}
        {...props}
      >
        {icon}
      </motion.button>
    )
  },
)

IconButton.displayName = 'IconButton'
