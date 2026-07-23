import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, FileWarning, FileText, Share2, Download } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { scaleIn } from '@/lib/motion'
import { canShareFiles } from '@/utils/download'
import { pdfjsLib } from '@/lib/pdfjs'
import type { ExportState } from '@/hooks/usePdfExport'

interface ExportProgressDialogProps extends ExportState {
  open: boolean
  onClose: () => void
  downloadResult: () => void
  shareResult: () => void
}

/** Renders the result PDF's first page as a preview image, for the success screen. */
function usePdfPreview(blob: Blob | undefined): string | null {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!blob) {
      setPreviewUrl(null)
      return
    }
    let cancelled = false
    let objectUrl: string | null = null

    async function render() {
      const bytes = await blob!.arrayBuffer()
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise
      const page = await doc.getPage(1)
      const viewport = page.getViewport({ scale: 1 })
      const scale = Math.min(1, 480 / Math.max(viewport.width, viewport.height))
      const scaledViewport = page.getViewport({ scale })

      const canvas = document.createElement('canvas')
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height
      const context = canvas.getContext('2d')
      if (!context) return
      await page.render({ canvas, canvasContext: context, viewport: scaledViewport, intent: 'print' }).promise
      if (cancelled) return

      const rendered = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!rendered || cancelled) return
      objectUrl = URL.createObjectURL(rendered)
      setPreviewUrl(objectUrl)
    }

    void render()
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [blob])

  return previewUrl
}

export function ExportProgressDialog({
  open,
  onClose,
  status,
  completed,
  total,
  errorMessage,
  resultBlob,
  downloadResult,
  shareResult,
}: ExportProgressDialogProps) {
  const percent = total > 0 ? (completed / total) * 100 : 0
  const previewUrl = usePdfPreview(status === 'success' ? resultBlob : undefined)

  return (
    <Dialog open={open} onClose={onClose} size={status === 'success' ? 'md' : 'sm'}>
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        {status === 'building' && (
          <>
            <motion.span
              variants={scaleIn}
              initial="initial"
              animate="animate"
              className="flex size-14 items-center justify-center rounded-full bg-white/8 text-ink"
            >
              <FileText className="size-6" />
            </motion.span>
            <div>
              <p className="text-sm font-semibold text-ink">Building your PDF…</p>
              <p className="mt-1 text-xs text-ink-muted">
                Page {completed} of {total}
              </p>
            </div>
            <ProgressBar value={percent} className="w-full" />
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex h-64 w-full items-center justify-center overflow-hidden rounded-[14px] bg-black/20">
              {previewUrl ? (
                <img src={previewUrl} alt="Exported PDF preview" className="max-h-full max-w-full object-contain shadow-lg" />
              ) : (
                <Spinner size={24} />
              )}
            </div>
            <div className="flex items-center gap-2">
              <motion.span
                variants={scaleIn}
                initial="initial"
                animate="animate"
                className="flex size-8 items-center justify-center rounded-full bg-success/15 text-success"
              >
                <CheckCircle2 className="size-4" />
              </motion.span>
              <p className="text-sm font-semibold text-ink">Your PDF is ready</p>
            </div>
            <div className="flex w-full gap-2">
              {canShareFiles() && (
                <Button
                  variant="secondary"
                  className="flex-1"
                  leadingIcon={<Share2 className="size-3.5" />}
                  onClick={() => void shareResult()}
                >
                  Share
                </Button>
              )}
              <Button className="flex-1" leadingIcon={<Download className="size-3.5" />} onClick={downloadResult}>
                Download PDF
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.span
              variants={scaleIn}
              initial="initial"
              animate="animate"
              className="flex size-14 items-center justify-center rounded-full bg-error/15 text-error"
            >
              <FileWarning className="size-7" />
            </motion.span>
            <p className="text-sm font-semibold text-ink">Export failed</p>
            {errorMessage && <p className="text-xs text-ink-muted">{errorMessage}</p>}
            <Button size="sm" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </>
        )}
      </div>
    </Dialog>
  )
}
