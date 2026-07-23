import { useState } from 'react'
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
import { downloadFileOrZip } from '@/utils/zipDownload'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'

type ImageFormat = 'jpeg' | 'png' | 'webp'

const FORMAT_CONFIG: Record<ImageFormat, { mime: string; extension: string; quality?: number }> = {
  jpeg: { mime: 'image/jpeg', extension: 'jpg', quality: 0.9 },
  png: { mime: 'image/png', extension: 'png' },
  webp: { mime: 'image/webp', extension: 'webp', quality: 0.9 },
}

const tool = getToolBySlug('pdf-to-image')!

export function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<ImageFormat>('jpeg')
  const [converting, setConverting] = useState(false)
  const [entries, setEntries] = useState<{ name: string; blob: Blob }[] | null>(null)
  const { doc, pageCount, loading, error } = useLoadedPdf(file)

  const handleConvert = async () => {
    if (!file || !doc) return
    setConverting(true)
    try {
      const config = FORMAT_CONFIG[format]
      const base = baseFileName(file.name)
      const results: { name: string; blob: Blob }[] = []
      for (let i = 1; i <= pageCount; i++) {
        const canvas = await renderPdfPageToCanvas(doc, i, 2)
        const blob = await canvasToBlob(canvas, config.mime, config.quality)
        results.push({ name: `${base}-page-${i}.${config.extension}`, blob })
      }
      setEntries(results)
      toast.success(`Exported ${results.length} page${results.length === 1 ? '' : 's'}`)
    } catch {
      toast.error("Couldn't export that PDF")
    } finally {
      setConverting(false)
    }
  }

  const reset = () => {
    setFile(null)
    setEntries(null)
  }

  return (
    <ToolPageLayout>
      <ToolPageHeader icon={tool.icon} title={tool.title} description={tool.description} />

      {entries ? (
        <ResultCard
          title="Export complete"
          description={`Converted ${entries.length} page${entries.length === 1 ? '' : 's'} to ${format.toUpperCase()}.`}
          downloadLabel={entries.length > 1 ? 'Download .zip' : 'Download'}
          onDownload={(fileName) => void downloadFileOrZip(entries, fileName)}
          onReset={reset}
          resultFileName={
            entries.length === 1 ? entries[0]!.name : `${baseFileName(file!.name)}-images.zip`
          }
          resultPageCount={entries.length}
        />
      ) : !file ? (
        <PdfDropzone onFilesAccepted={(files) => setFile(files[0]!)} />
      ) : (
        <>
          {loading && <p className="text-center text-sm text-ink-muted">Reading pages…</p>}
          {error && <p className="text-center text-sm text-error">{error}</p>}
          {doc && (
            <>
              <GlassCard className="mx-auto w-full max-w-xs p-5">
                <Select
                  label="Format"
                  value={format}
                  onChange={(event) => setFormat(event.target.value as ImageFormat)}
                  options={[
                    { value: 'jpeg', label: 'JPG' },
                    { value: 'png', label: 'PNG' },
                    { value: 'webp', label: 'WEBP' },
                  ]}
                />
              </GlassCard>
              <p className="text-center text-sm text-ink-muted">
                {pageCount} page{pageCount === 1 ? '' : 's'} ready to export as {format.toUpperCase()}.
              </p>
              <Button className="self-center" loading={converting} onClick={() => void handleConvert()}>
                Convert to {format.toUpperCase()}
              </Button>
            </>
          )}
        </>
      )}
    </ToolPageLayout>
  )
}
