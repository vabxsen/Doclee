import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  valueLabel?: string
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, valueLabel, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {(label || valueLabel) && (
          <div className="flex items-center justify-between text-xs text-ink-muted">
            {label && <label htmlFor={id}>{label}</label>}
            {valueLabel && <span className="tabular-nums text-ink">{valueLabel}</span>}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          type="range"
          className={cn(
            'focus-ring h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-white',
            '[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(255,255,255,0.12)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-white',
            className,
          )}
          {...props}
        />
      </div>
    )
  },
)

Slider.displayName = 'Slider'
