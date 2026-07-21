import { useState } from 'react'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { toast } from 'sonner'
import { ToolPageHeader } from '@/components/tools/ToolPageHeader'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { PdfDropzone } from '@/components/tools/PdfDropzone'
import { ResultCard } from '@/components/tools/ResultCard'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Slider } from '@/components/ui/Slider'
import { baseFileName } from '@/services/pdf/pdfFileIO'
import { drawWatermarkOnPage } from '@/services/pdf/watermark'
import { downloadBlob } from '@/utils/download'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'
import type { WatermarkSettings } from '@/types/pdf'

const tool = getToolBySlug('watermark-pdf')!

export function WatermarkPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [settings, setSettings] = useState<WatermarkSettings>({
    enabled: true,
    text: 'CONFIDENTIAL',
    opacity: 0.2,
    fontSizePt: 48,
    rotationDeg: -45,
  })
  const [processing, setProcessing] = useState(false)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)

  const handleApply = async () => {
    if (!file || !settings.text.trim()) return
    setProcessing(true)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      pdf.getPages().forEach((page) => drawWatermarkOnPage(page, settings, font))
      const outBytes = await pdf.save()
      setResultBlob(new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' }))
      toast.success('Watermark applied')
    } catch {
      toast.error("Couldn't watermark that PDF")
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

      {resultBlob ? (
        <ResultCard
          title="Watermark applied"
          description="Every page now carries your watermark."
          onDownload={() => downloadBlob(resultBlob, `${baseFileName(file!.name)}-watermarked.pdf`)}
          onReset={reset}
          resultBlob={resultBlob}
          resultFileName={`${baseFileName(file!.name)}-watermarked.pdf`}
        />
      ) : !file ? (
        <PdfDropzone onFilesAccepted={(files) => setFile(files[0]!)} />
      ) : (
        <>
          <GlassCard className="flex flex-col gap-5 p-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-ink-muted" htmlFor="watermark-text">
                Watermark text
              </label>
              <input
                id="watermark-text"
                value={settings.text}
                onChange={(event) => setSettings((prev) => ({ ...prev, text: event.target.value }))}
                className="focus-ring glass h-10 w-full rounded-[14px] px-3 text-sm text-ink"
              />
            </div>
            <Slider
              label="Opacity"
              valueLabel={`${Math.round(settings.opacity * 100)}%`}
              min={0.05}
              max={0.8}
              step={0.05}
              value={settings.opacity}
              onChange={(event) => setSettings((prev) => ({ ...prev, opacity: Number(event.target.value) }))}
            />
            <Slider
              label="Rotation"
              valueLabel={`${settings.rotationDeg}°`}
              min={-90}
              max={90}
              step={5}
              value={settings.rotationDeg}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, rotationDeg: Number(event.target.value) }))
              }
            />
            <Slider
              label="Font size"
              valueLabel={`${settings.fontSizePt}pt`}
              min={16}
              max={96}
              step={2}
              value={settings.fontSizePt}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, fontSizePt: Number(event.target.value) }))
              }
            />
          </GlassCard>
          <Button
            className="self-center"
            disabled={!settings.text.trim()}
            loading={processing}
            onClick={() => void handleApply()}
          >
            Apply watermark
          </Button>
        </>
      )}
    </ToolPageLayout>
  )
}
