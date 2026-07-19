import { useRef, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { toast } from 'sonner'
import { Eraser } from 'lucide-react'
import { ToolPageHeader } from '@/components/tools/ToolPageHeader'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { PdfDropzone } from '@/components/tools/PdfDropzone'
import { ResultCard } from '@/components/tools/ResultCard'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Select } from '@/components/ui/Select'
import { useLoadedPdf } from '@/hooks/useLoadedPdf'
import { baseFileName } from '@/services/pdf/pdfFileIO'
import { downloadBlob } from '@/utils/download'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'

const tool = getToolBySlug('sign-pdf')!

type Corner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

const SIGNATURE_WIDTH_PT = 140
const SIGNATURE_HEIGHT_PT = 56
const MARGIN_PT = 36

export function SignPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [corner, setCorner] = useState<Corner>('bottom-right')
  const [hasSignature, setHasSignature] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const { pageCount } = useLoadedPdf(file)

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawingRef.current = true
    const { x, y } = getCanvasPoint(event)
    ctx.beginPath()
    ctx.moveTo(x, y)
    canvas.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { x, y } = getCanvasPoint(event)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#ffffff'
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const handlePointerUp = () => {
    drawingRef.current = false
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleApply = async () => {
    const canvas = canvasRef.current
    if (!file || !canvas || !hasSignature) return
    setProcessing(true)
    try {
      const signatureDataUrl = canvas.toDataURL('image/png')
      const signatureBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer())

      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const signatureImage = await pdf.embedPng(signatureBytes)
      const page = pdf.getPage(Math.max(0, Math.min(pageIndex, pdf.getPageCount() - 1)))
      const { width, height } = page.getSize()

      const x = corner.includes('right') ? width - SIGNATURE_WIDTH_PT - MARGIN_PT : MARGIN_PT
      const y = corner.includes('bottom') ? MARGIN_PT : height - SIGNATURE_HEIGHT_PT - MARGIN_PT

      page.drawImage(signatureImage, { x, y, width: SIGNATURE_WIDTH_PT, height: SIGNATURE_HEIGHT_PT })

      const outBytes = await pdf.save()
      setResultBlob(new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' }))
      toast.success('Signature added')
    } catch {
      toast.error("Couldn't sign that PDF")
    } finally {
      setProcessing(false)
    }
  }

  const reset = () => {
    setFile(null)
    setResultBlob(null)
    clearSignature()
  }

  return (
    <ToolPageLayout>
      <ToolPageHeader icon={tool.icon} title={tool.title} description={tool.description} />

      {resultBlob ? (
        <ResultCard
          title="PDF signed"
          description="Your signature has been placed on the page."
          onDownload={() => downloadBlob(resultBlob, `${baseFileName(file!.name)}-signed.pdf`)}
          onReset={reset}
        />
      ) : !file ? (
        <PdfDropzone onFilesAccepted={(files) => setFile(files[0]!)} />
      ) : (
        <>
          <GlassCard className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Draw your signature</p>
              <Button
                variant="secondary"
                size="sm"
                leadingIcon={<Eraser className="size-3.5" />}
                onClick={clearSignature}
              >
                Clear
              </Button>
            </div>
            <canvas
              ref={canvasRef}
              width={480}
              height={180}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="glass-strong h-[140px] w-full touch-none rounded-[14px]"
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Page"
                value={pageIndex}
                onChange={(event) => setPageIndex(Number(event.target.value))}
                options={Array.from({ length: pageCount }, (_, i) => ({
                  value: String(i),
                  label: `Page ${i + 1}`,
                }))}
              />
              <Select
                label="Position"
                value={corner}
                onChange={(event) => setCorner(event.target.value as Corner)}
                options={[
                  { value: 'bottom-right', label: 'Bottom right' },
                  { value: 'bottom-left', label: 'Bottom left' },
                  { value: 'top-right', label: 'Top right' },
                  { value: 'top-left', label: 'Top left' },
                ]}
              />
            </div>
          </GlassCard>
          <Button
            className="self-center"
            disabled={!hasSignature}
            loading={processing}
            onClick={() => void handleApply()}
          >
            Sign PDF
          </Button>
        </>
      )}
    </ToolPageLayout>
  )
}
