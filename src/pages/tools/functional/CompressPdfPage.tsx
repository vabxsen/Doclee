import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { toast } from 'sonner'
import { ToolPageHeader } from '@/components/tools/ToolPageHeader'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { PdfDropzone } from '@/components/tools/PdfDropzone'
import { ResultCard } from '@/components/tools/ResultCard'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Select } from '@/components/ui/Select'
import { useLoadedPdf } from '@/hooks/useLoadedPdf'
import { renderPdfPageToCanvas, canvasToBlob, baseFileName } from '@/services/pdf/pdfFileIO'
import { downloadBlob } from '@/utils/download'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'

const tool = getToolBySlug('compress-pdf')!

type Level = 'low' | 'medium' | 'high'

const LEVEL_CONFIG: Record<Level, { scale: number; quality: number; label: string }> = {
  low: { scale: 2, quality: 0.8, label: 'Low compression — best quality' },
  medium: { scale: 1.4, quality: 0.65, label: 'Medium compression' },
  high: { scale: 1, quality: 0.45, label: 'High compression — smallest file' },
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [level, setLevel] = useState<Level>('medium')
  const [processing, setProcessing] = useState(false)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const { doc, pageCount, loading, error } = useLoadedPdf(file)

  const handleApply = async () => {
    if (!file || !doc) return
    setProcessing(true)
    try {
      const bytes = await file.arrayBuffer()
      const source = await PDFDocument.load(bytes)
      const output = await PDFDocument.create()
      const config = LEVEL_CONFIG[level]

      for (let i = 0; i < pageCount; i++) {
        const sourcePage = source.getPage(i)
        const { width, height } = sourcePage.getSize()
        const canvas = await renderPdfPageToCanvas(doc, i + 1, config.scale)
        const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', config.quality)
        const jpegBytes = await jpegBlob.arrayBuffer()
        const image = await output.embedJpg(jpegBytes)
        const page = output.addPage([width, height])
        page.drawImage(image, { x: 0, y: 0, width, height })
      }

      const outBytes = await output.save()
      const blob = new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' })
      setResultBlob(blob)
      const reduction = Math.round((1 - blob.size / file.size) * 100)
      toast.success(
        reduction > 0 ? `Reduced file size by ${reduction}%` : 'Compression complete',
      )
    } catch {
      toast.error("Couldn't compress that PDF")
    } finally {
      setProcessing(false)
    }
  }

  const reset = () => {
    setFile(null)
    setResultBlob(null)
  }

  return (
    <ToolPageLayout>
      <ToolPageHeader icon={tool.icon} title={tool.title} description={tool.description} />

      {resultBlob && file ? (
        <ResultCard
          title="Compression complete"
          description={`${formatBytes(file.size)} → ${formatBytes(resultBlob.size)}`}
          onDownload={() => downloadBlob(resultBlob, `${baseFileName(file.name)}-compressed.pdf`)}
          onReset={reset}
          resultBlob={resultBlob}
          resultFileName={`${baseFileName(file.name)}-compressed.pdf`}
        />
      ) : !file ? (
        <PdfDropzone onFilesAccepted={(files) => setFile(files[0]!)} />
      ) : (
        <>
          {loading && <p className="text-center text-sm text-ink-muted">Reading pages…</p>}
          {error && <p className="text-center text-sm text-error">{error}</p>}
          {doc && (
            <>
              <GlassCard className="flex flex-col gap-4 p-5">
                <p className="text-sm text-ink-muted">Original size: {formatBytes(file.size)}</p>
                <Select
                  label="Compression level"
                  value={level}
                  onChange={(event) => setLevel(event.target.value as Level)}
                  options={[
                    { value: 'low', label: LEVEL_CONFIG.low.label },
                    { value: 'medium', label: LEVEL_CONFIG.medium.label },
                    { value: 'high', label: LEVEL_CONFIG.high.label },
                  ]}
                />
              </GlassCard>
              <Button className="self-center" loading={processing} onClick={() => void handleApply()}>
                Compress PDF
              </Button>
            </>
          )}
        </>
      )}
    </ToolPageLayout>
  )
}
