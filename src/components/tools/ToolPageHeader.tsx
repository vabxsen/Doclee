import type { LucideIcon } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'

interface ToolPageHeaderProps {
  icon: LucideIcon
  title: string
  description: string
}

export function ToolPageHeader({ icon: Icon, title, description }: ToolPageHeaderProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <SEO title={title} description={description} />
      <span className="flex size-14 items-center justify-center rounded-full bg-white/8 text-ink">
        <Icon className="size-6" />
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-ink-muted">{description}</p>
    </div>
  )
}
