import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { snapTransition } from '@/lib/motion'
import type { MotionSafeProps } from '@/lib/motionTypes'
import {
  buttonBaseClasses,
  buttonSizeClasses,
  buttonVariantClasses,
  type ButtonSize,
  type ButtonVariant,
} from '@/components/ui/buttonStyles'

export type { ButtonVariant, ButtonSize }

interface ButtonProps extends MotionSafeProps<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leadingIcon,
      trailingIcon,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={disabled || loading ? undefined : { scale: 1.02 }}
        whileTap={disabled || loading ? undefined : { scale: 0.97 }}
        transition={snapTransition}
        disabled={disabled || loading}
        className={cn(
          buttonBaseClasses,
          buttonVariantClasses[variant],
          buttonSizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          leadingIcon
        )}
        {children}
        {!loading && trailingIcon}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'
