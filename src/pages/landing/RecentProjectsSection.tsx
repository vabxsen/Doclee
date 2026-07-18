import { FileImage } from 'lucide-react'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useCanvasRenderer } from '@/hooks/useCanvasRenderer'
import { GlassCard } from '@/components/ui/GlassCard'
import { LinkButton } from '@/components/ui/LinkButton'
import { pluralize } from '@/lib/format'

export function RecentProjectsSection() {
  const images = useDocumentStore((state) => state.images)
  const { url } = useCanvasRenderer(images[0], { maxDimension: 240 })

  if (images.length === 0) return null

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10">
      <h2 className="mb-4 text-lg font-semibold text-ink">Continue where you left off</h2>
      <GlassCard hoverable className="flex items-center gap-4 p-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-black/40">
          {url ? (
            <img src={url} alt="" className="size-full object-cover" />
          ) : (
            <FileImage className="size-6 text-ink-muted" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink">In-progress document</p>
          <p className="text-xs text-ink-muted">{pluralize(images.length, 'page')} · autosaved locally</p>
        </div>
        <LinkButton to="/tools/image-to-pdf" size="sm">
          Continue
        </LinkButton>
      </GlassCard>
    </section>
  )
}
