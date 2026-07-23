import { useCallback, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { toast } from 'sonner'
import { CircleCheck } from 'lucide-react'
import { ToolPageHeader } from '@/components/tools/ToolPageHeader'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { PdfDropzone } from '@/components/tools/PdfDropzone'
import { PageThumbnail } from '@/components/tools/PageThumbnail'
import { ResultCard } from '@/components/tools/ResultCard'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { useLoadedPdf } from '@/hooks/useLoadedPdf'
import { baseFileName } from '@/services/pdf/pdfFileIO'
import { downloadBlob } from '@/utils/download'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'

const tool = getToolBySlug('extract-pages')!

export function ExtractPagesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [processing, setProcessing] = useState(false)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const { doc, pageCount, loading, error } = useLoadedPdf(file)

  const toggle = useCallback((pageNumber: number) => {
    const index = pageNumber - 1
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  const handleApply = async () => {
    if (!file || selected.size === 0) return
    setProcessing(true)
    try {
      const bytes = await file.arrayBuffer()
      const source = await PDFDocument.load(bytes)
      const out = await PDFDocument.create()
      const indices = Array.from(selected).sort((a, b) => a - b)
      const copied = await out.copyPages(source, indices)
      copied.forEach((page) => out.addPage(page))
      const outBytes = await out.save()
      setResultBlob(new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' }))
      toast.success(`Extracted ${indices.length} page${indices.length === 1 ? '' : 's'}`)
    } catch {
      toast.error("Couldn't extract those pages")
    } finally {
      setProcessing(false)
    }
  }

  const reset = () => {
    setFile(null)
    setSelected(new Set())
    setResultBlob(null)
  }

  return (
    <ToolPageLayout>
      <ToolPageHeader icon={tool.icon} title={tool.title} description={tool.description} />

      {resultBlob ? (
        <ResultCard
          title="Pages extracted"
          description={`Pulled ${selected.size} page${selected.size === 1 ? '' : 's'} into a new PDF.`}
          onDownload={(fileName) => downloadBlob(resultBlob, fileName)}
          onReset={reset}
          resultBlob={resultBlob}
          resultFileName={`${baseFileName(file!.name)}-extracted.pdf`}
        />
      ) : !file ? (
        <PdfDropzone onFilesAccepted={(files) => setFile(files[0]!)} />
      ) : (
        <>
          {loading && <p className="text-center text-sm text-ink-muted">Reading pages…</p>}
          {error && <p className="text-center text-sm text-error">{error}</p>}
          {doc && (
            <>
              <p className="text-center text-xs text-ink-muted">
                Click the pages you want to keep.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {Array.from({ length: pageCount }, (_, i) => (
                  <PageThumbnail
                    key={i}
                    doc={doc}
                    pageNumber={i + 1}
                    onClick={toggle}
                    className={cn(selected.has(i) && 'ring-2 ring-success')}
                    cornerIcon={selected.has(i) ? CircleCheck : undefined}
                    cornerWrapClassName="bg-success text-black"
                    cornerIconClassName="size-3.5"
                  />
                ))}
              </div>
              <Button
                className="self-center"
                disabled={selected.size === 0}
                loading={processing}
                onClick={() => void handleApply()}
              >
                Extract {selected.size > 0 ? `${selected.size} page${selected.size === 1 ? '' : 's'}` : 'pages'}
              </Button>
            </>
          )}
        </>
      )}
    </ToolPageLayout>
  )
}
