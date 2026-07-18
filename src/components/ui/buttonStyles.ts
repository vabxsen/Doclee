export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-white text-black hover:bg-white/90',
  secondary: 'glass text-ink hover:bg-glass-strong',
  ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-white/5',
  danger: 'bg-error/15 text-error border border-error/30 hover:bg-error/25',
}

export const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-[12px]',
  md: 'h-10 px-4 text-sm gap-2 rounded-btn',
  lg: 'h-12 px-6 text-base gap-2 rounded-btn',
  icon: 'h-10 w-10 rounded-btn',
}

export const buttonBaseClasses =
  'focus-ring inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40'
