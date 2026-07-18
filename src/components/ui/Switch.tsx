import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { snapTransition } from '@/lib/motion'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  id?: string
}

export function Switch({ checked, onCheckedChange, label, disabled, id }: SwitchProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'focus-ring relative h-6 w-10 rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40',
          checked ? 'bg-white' : 'bg-white/15',
        )}
      >
        <motion.span
          layout
          transition={snapTransition}
          className={cn(
            'absolute top-0.5 size-5 rounded-full shadow-sm',
            checked ? 'right-0.5 bg-black' : 'left-0.5 bg-white',
          )}
        />
      </button>
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  )
}
