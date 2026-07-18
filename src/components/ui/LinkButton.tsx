import { forwardRef } from 'react'
import type { ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { motion } from 'framer-motion'
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

const MotionLink = motion.create(Link)

interface LinkButtonProps extends MotionSafeProps<LinkProps> {
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  children: ReactNode
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    { className, variant = 'primary', size = 'md', leadingIcon, trailingIcon, children, ...props },
    ref,
  ) => {
    return (
      <MotionLink
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={snapTransition}
        className={cn(
          buttonBaseClasses,
          buttonVariantClasses[variant],
          buttonSizeClasses[size],
          className,
        )}
        {...props}
      >
        {leadingIcon}
        {children}
        {trailingIcon}
      </MotionLink>
    )
  },
)

LinkButton.displayName = 'LinkButton'
