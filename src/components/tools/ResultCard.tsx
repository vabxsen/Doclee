import { CircleCheck, Download, RotateCcw } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'

interface ResultCardProps {
  title: string
  description: string
  onDownload: () => void
  onReset: () => void
  downloadLabel?: string
}

export function ResultCard({ title, description, onDownload, onReset, downloadLabel = 'Download' }: ResultCardProps) {
  return (
    <GlassCard className="flex flex-col items-center gap-3 p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
        <CircleCheck className="size-6" />
      </span>
      <div>
        <p className="text-base font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      </div>
      <div className="mt-2 flex gap-2">
        <Button variant="secondary" leadingIcon={<RotateCcw className="size-3.5" />} onClick={onReset}>
          Start over
        </Button>
        <Button leadingIcon={<Download className="size-3.5" />} onClick={onDownload}>
          {downloadLabel}
        </Button>
      </div>
    </GlassCard>
  )
}
