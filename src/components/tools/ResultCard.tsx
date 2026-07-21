import { useEffect, useRef, useState } from 'react'
import { CircleCheck, Download, RotateCcw } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { logResultToHistory } from '@/services/projectHistory/logResultToHistory'

interface ResultCardProps {
  title: string
  description: string
  onDownload: () => void
  onReset: () => void
  downloadLabel?: string
  /** When provided, the result is logged to the signed-in user's history. */
  resultBlob?: Blob
  resultFileName?: string
  /** Page count for history when the blob isn't a readable PDF (zips, docx, …). */
  resultPageCount?: number
}

type DownloadState = 'idle' | 'downloading' | 'done'

export function ResultCard({
  title,
  description,
  onDownload,
  onReset,
  downloadLabel = 'Download',
  resultBlob,
  resultFileName,
  resultPageCount,
}: ResultCardProps) {
  const [downloadState, setDownloadState] = useState<DownloadState>('idle')
  const timersRef = useRef<number[]>([])
  const loggedRef = useRef(false)

  useEffect(() => {
    if (loggedRef.current || !resultFileName) return
    loggedRef.current = true
    void logResultToHistory({ blob: resultBlob, fileName: resultFileName, pageCount: resultPageCount })
  }, [resultBlob, resultFileName, resultPageCount])

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
    },
    [],
  )

  const handleDownload = () => {
    if (downloadState !== 'idle') return
    setDownloadState('downloading')
    onDownload()
    timersRef.current.push(
      window.setTimeout(() => setDownloadState('done'), 900),
      window.setTimeout(() => setDownloadState('idle'), 3500),
    )
  }

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
        <Button
          loading={downloadState === 'downloading'}
          leadingIcon={
            downloadState === 'done' ? (
              <CircleCheck className="size-3.5" />
            ) : (
              <Download className="size-3.5" />
            )
          }
          className={cn(
            downloadState === 'done' &&
              'bg-success/15 text-success hover:bg-success/15 border border-success/30',
          )}
          onClick={handleDownload}
        >
          {downloadState === 'downloading'
            ? 'Downloading…'
            : downloadState === 'done'
              ? 'Download complete'
              : downloadLabel}
        </Button>
      </div>
    </GlassCard>
  )
}
