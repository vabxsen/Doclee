import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-[12px] bg-white/6', className)}
      aria-hidden="true"
    />
  )
}
