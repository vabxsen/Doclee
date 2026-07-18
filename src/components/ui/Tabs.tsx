import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { snapTransition } from '@/lib/motion'

interface TabItem {
  value: string
  label: string
}

interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  layoutId?: string
  className?: string
}

export function Tabs({ items, value, onChange, layoutId = 'tabs-indicator', className }: TabsProps) {
  return (
    <div role="tablist" className={cn('glass inline-flex gap-1 rounded-[14px] p-1', className)}>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'focus-ring relative rounded-[10px] px-3 py-1.5 text-sm font-medium transition-colors',
              active ? 'text-black' : 'text-ink-muted hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={snapTransition}
                className="absolute inset-0 rounded-[10px] bg-white"
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
