import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SpinnerProps {
  size?: number
  className?: string
}

export function Spinner({ size = 20, className }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-ink-muted', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  )
}
