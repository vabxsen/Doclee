import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
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

const tool = getToolBySlug('delete-pages')!

export function DeletePagesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [marked, setMarked] = useState<Set<number>>(new Set())
  const [processing, setProcessing] = useState(false)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const { doc, pageCount, loading, error } = useLoadedPdf(file)

  const toggle = (index: number) => {
    setMarked((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleApply = async () => {
    if (!file || marked.size === 0) return
    if (marked.size >= pageCount) {
      toast.error('Keep at least one page')
      return
    }
    setProcessing(true)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const toRemove = Array.from(marked).sort((a, b) => b - a)
      toRemove.forEach((index) => pdf.removePage(index))
      const outBytes = await pdf.save()
      setResultBlob(new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' }))
      toast.success(`Removed ${marked.size} page${marked.size === 1 ? '' : 's'}`)
    } catch {
      toast.error("Couldn't edit that PDF")
    } finally {
      setProcessing(false)
    }
  }

  const reset = () => {
    setFile(null)
    setMarked(new Set())
    setResultBlob(null)
  }

  return (
    <ToolPageLayout>
      <ToolPageHeader icon={tool.icon} title={tool.title} description={tool.description} />

      {resultBlob ? (
        <ResultCard
          title="Pages removed"
          description={`Deleted ${marked.size} page${marked.size === 1 ? '' : 's'}.`}
          onDownload={() => downloadBlob(resultBlob, `${baseFileName(file!.name)}-edited.pdf`)}
          onReset={reset}
          resultBlob={resultBlob}
          resultFileName={`${baseFileName(file!.name)}-edited.pdf`}
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
                Click the pages you want to remove.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {Array.from({ length: pageCount }, (_, i) => (
                  <PageThumbnail
                    key={i}
                    doc={doc}
                    pageNumber={i + 1}
                    onClick={() => toggle(i)}
                    className={cn(marked.has(i) && 'opacity-40 ring-2 ring-error')}
                    overlay={
                      marked.has(i) && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Trash2 className="size-5 text-error" />
                        </span>
                      )
                    }
                  />
                ))}
              </div>
              <Button
                variant="danger"
                className="self-center"
                disabled={marked.size === 0}
                loading={processing}
                onClick={() => void handleApply()}
              >
                Delete {marked.size > 0 ? `${marked.size} page${marked.size === 1 ? '' : 's'}` : 'pages'}
              </Button>
            </>
          )}
        </>
      )}
    </ToolPageLayout>
  )
}
