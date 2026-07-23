import { useState } from 'react'
import { toast } from 'sonner'
import { Check, Crop, Plus, Trash2, Wand2 } from 'lucide-react'
import { ToolPageHeader } from '@/components/tools/ToolPageHeader'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { ResultCard } from '@/components/tools/ResultCard'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Switch } from '@/components/ui/Switch'
import { CameraCapture } from '@/components/scanner/CameraCapture'
import { CornerAdjuster } from '@/components/scanner/CornerAdjuster'
import {
  defaultQuadForSize,
  estimateOutputSize,
  isFullQuad,
  warpQuadToRect,
  type Quad,
} from '@/services/scanner/perspectiveWarp'
import { buildScanPdf } from '@/services/scanner/buildScanPdf'
import { downloadBlob } from '@/utils/download'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'

const tool = getToolBySlug('document-scanner')!

interface ScannedPage {
  id: string
  canvas: HTMLCanvasElement
  thumbUrl: string
}

/** Applies a flat grayscale + contrast boost — a plain canvas filter, no ML involved — to make text scans crisper. */
function applyEnhance(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.filter = 'grayscale(1) contrast(1.35) brightness(1.08)'
  ctx.drawImage(source, 0, 0)
  return canvas
}

export function DocumentScannerPage() {
  const [pendingCanvas, setPendingCanvas] = useState<HTMLCanvasElement | null>(null)
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null)
  const [quad, setQuad] = useState<Quad | null>(null)
  const [cropping, setCropping] = useState(false)
  const [enhance, setEnhance] = useState(false)
  const [pages, setPages] = useState<ScannedPage[]>([])
  const [processing, setProcessing] = useState(false)
  const [building, setBuilding] = useState(false)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)

  const handleCapture = (canvas: HTMLCanvasElement) => {
    setPendingCanvas(canvas)
    setPendingImageUrl(canvas.toDataURL('image/jpeg', 0.92))
    setQuad(defaultQuadForSize(canvas.width, canvas.height))
  }

  const cancelPending = () => {
    setPendingCanvas(null)
    setPendingImageUrl(null)
    setQuad(null)
    setCropping(false)
  }

  const confirmPage = async () => {
    if (!pendingCanvas || !quad) return
    setProcessing(true)
    try {
      // Skip the warp entirely when the quad was never adjusted — the full
      // photo passes through without a lossy resample.
      let warped = pendingCanvas
      if (!isFullQuad(quad, pendingCanvas.width, pendingCanvas.height)) {
        const { width, height } = estimateOutputSize(quad)
        warped = warpQuadToRect(pendingCanvas, quad, width, height)
      }
      if (enhance) warped = applyEnhance(warped)
      const thumbUrl = warped.toDataURL('image/jpeg', 0.7)
      setPages((prev) => [...prev, { id: crypto.randomUUID(), canvas: warped, thumbUrl }])
      cancelPending()
    } catch {
      toast.error("Couldn't process that page")
    } finally {
      setProcessing(false)
    }
  }

  const removePage = (id: string) => {
    setPages((prev) => prev.filter((page) => page.id !== id))
  }

  const handleBuildPdf = async () => {
    if (pages.length === 0) return
    setBuilding(true)
    try {
      const bytes = await buildScanPdf(pages.map((page) => page.canvas))
      setResultBlob(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }))
      toast.success('Scan complete')
    } catch {
      toast.error("Couldn't build the PDF from these pages")
    } finally {
      setBuilding(false)
    }
  }

  const reset = () => {
    setPages([])
    setResultBlob(null)
    cancelPending()
  }

  return (
    <ToolPageLayout>
      <ToolPageHeader icon={tool.icon} title={tool.title} description={tool.description} compact />

      {resultBlob ? (
        <ResultCard
          title="Scan complete"
          description={`${pages.length} page${pages.length === 1 ? '' : 's'} saved as a PDF.`}
          onDownload={(fileName) => downloadBlob(resultBlob, fileName)}
          onReset={reset}
          resultBlob={resultBlob}
          resultFileName="scan.pdf"
        />
      ) : (
        <>
          {pages.length > 0 && (
            <GlassCard className="flex flex-col gap-3 p-4">
              <p className="text-sm font-medium text-ink">{pages.length} page{pages.length === 1 ? '' : 's'}</p>
              <div className="flex flex-wrap gap-3">
                {pages.map((page) => (
                  <div key={page.id} className="group relative h-24 w-[72px] overflow-hidden rounded-[10px]">
                    <img src={page.thumbUrl} alt="Scanned page" className="size-full object-cover" />
                    <button
                      type="button"
                      aria-label="Remove page"
                      onClick={() => removePage(page.id)}
                      className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-ink opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {pendingCanvas && pendingImageUrl && quad ? (
            <>
              {cropping ? (
                <CornerAdjuster
                  imageUrl={pendingImageUrl}
                  naturalWidth={pendingCanvas.width}
                  naturalHeight={pendingCanvas.height}
                  quad={quad}
                  onChange={setQuad}
                />
              ) : (
                <img
                  src={pendingImageUrl}
                  alt="Captured page"
                  className="mx-auto max-w-full rounded-[14px]"
                  style={{ height: '42dvh' }}
                />
              )}
              <GlassCard className="flex items-center justify-between p-3">
                <Switch
                  id="scan-enhance"
                  checked={enhance}
                  onCheckedChange={setEnhance}
                  label="Black & white text mode"
                />
                <Wand2 className="size-4 text-ink-muted" />
              </GlassCard>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 whitespace-nowrap"
                  variant="secondary"
                  onClick={cancelPending}
                  disabled={processing}
                >
                  Retake
                </Button>
                <Button
                  size="sm"
                  className="flex-1 whitespace-nowrap"
                  variant="secondary"
                  leadingIcon={cropping ? <Check className="size-3.5" /> : <Crop className="size-3.5" />}
                  onClick={() => setCropping((prev) => !prev)}
                  disabled={processing}
                >
                  {cropping ? 'Done' : 'Crop image'}
                </Button>
                <Button
                  size="sm"
                  className="flex-1 whitespace-nowrap"
                  loading={processing}
                  onClick={() => void confirmPage()}
                >
                  Use this page
                </Button>
              </div>
            </>
          ) : (
            <>
              <CameraCapture onCapture={handleCapture} />
              {pages.length > 0 && (
                <Button
                  className="self-center"
                  leadingIcon={<Plus className="size-3.5" />}
                  loading={building}
                  onClick={() => void handleBuildPdf()}
                >
                  Create PDF from {pages.length} page{pages.length === 1 ? '' : 's'}
                </Button>
              )}
            </>
          )}
        </>
      )}
    </ToolPageLayout>
  )
}
