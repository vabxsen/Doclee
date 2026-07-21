import type { LucideIcon } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'

interface ToolPageHeaderProps {
  icon: LucideIcon
  title: string
  description: string
  /** Hides the icon and description on mobile — for tools (like the scanner) that need every vertical pixel there. */
  compact?: boolean
}

export function ToolPageHeader({ icon: Icon, title, description, compact = false }: ToolPageHeaderProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <SEO title={title} description={description} />
      <span
        className={`${compact ? 'hidden sm:flex' : 'flex'} size-14 items-center justify-center rounded-full bg-white/8 text-ink`}
      >
        <Icon className="size-6" />
      </span>
      <h1 className={`${compact ? 'mt-0 sm:mt-4' : 'mt-4'} text-2xl font-semibold tracking-tight text-ink`}>
        {title}
      </h1>
      <p className={`${compact ? 'hidden sm:block' : ''} mt-2 max-w-md text-sm text-ink-muted`}>
        {description}
      </p>
    </div>
  )
}
