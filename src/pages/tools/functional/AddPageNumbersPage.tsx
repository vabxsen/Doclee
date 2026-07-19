import { useState } from 'react'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { toast } from 'sonner'
import { ToolPageHeader } from '@/components/tools/ToolPageHeader'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { PdfDropzone } from '@/components/tools/PdfDropzone'
import { ResultCard } from '@/components/tools/ResultCard'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Select } from '@/components/ui/Select'
import { baseFileName } from '@/services/pdf/pdfFileIO'
import { drawPageNumber } from '@/services/pdf/pageNumbers'
import { downloadBlob } from '@/utils/download'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'
import type { PageNumberSettings, VerticalAlign } from '@/types/pdf'

const tool = getToolBySlug('add-page-numbers')!

export function AddPageNumbersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [settings, setSettings] = useState<PageNumberSettings>({
    enabled: true,
    format: '{n} / {total}',
    position: 'bottom',
  })
  const [processing, setProcessing] = useState(false)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)

  const handleApply = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      const pages = pdf.getPages()
      pages.forEach((page, index) => drawPageNumber(page, settings, font, index, pages.length))
      const outBytes = await pdf.save()
      setResultBlob(new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' }))
      toast.success('Page numbers added')
    } catch {
      toast.error("Couldn't number that PDF")
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
          title="Page numbers added"
          description="Every page is now numbered."
          onDownload={() => downloadBlob(resultBlob, `${baseFileName(file!.name)}-numbered.pdf`)}
          onReset={reset}
        />
      ) : !file ? (
        <PdfDropzone onFilesAccepted={(files) => setFile(files[0]!)} />
      ) : (
        <>
          <GlassCard className="flex flex-col gap-5 p-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-ink-muted" htmlFor="format">
                Format ({'{n}'} = page number, {'{total}'} = total pages)
              </label>
              <input
                id="format"
                value={settings.format}
                onChange={(event) => setSettings((prev) => ({ ...prev, format: event.target.value }))}
                className="focus-ring glass h-10 w-full rounded-[14px] px-3 text-sm text-ink"
              />
            </div>
            <Select
              label="Position"
              value={settings.position}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, position: event.target.value as VerticalAlign }))
              }
              options={[
                { value: 'top', label: 'Top' },
                { value: 'center', label: 'Center' },
                { value: 'bottom', label: 'Bottom' },
              ]}
            />
          </GlassCard>
          <Button
            className="self-center"
            disabled={!settings.format.trim()}
            loading={processing}
            onClick={() => void handleApply()}
          >
            Add page numbers
          </Button>
        </>
      )}
    </ToolPageLayout>
  )
}
