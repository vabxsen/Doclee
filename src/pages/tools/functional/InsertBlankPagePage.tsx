import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { toast } from 'sonner'
import { ToolPageHeader } from '@/components/tools/ToolPageHeader'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { PdfDropzone } from '@/components/tools/PdfDropzone'
import { PageThumbnail } from '@/components/tools/PageThumbnail'
import { ResultCard } from '@/components/tools/ResultCard'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Select } from '@/components/ui/Select'
import { useLoadedPdf } from '@/hooks/useLoadedPdf'
import { baseFileName } from '@/services/pdf/pdfFileIO'
import { downloadBlob } from '@/utils/download'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'

const tool = getToolBySlug('insert-blank-page')!

export function InsertBlankPagePage() {
  const [file, setFile] = useState<File | null>(null)
  const [afterPage, setAfterPage] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const { doc, pageCount, loading, error } = useLoadedPdf(file)

  const handleApply = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const reference = pdf.getPage(Math.max(0, Math.min(afterPage, pdf.getPageCount() - 1)))
      const { width, height } = reference.getSize()
      pdf.insertPage(afterPage, [width, height])
      const outBytes = await pdf.save()
      setResultBlob(new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' }))
      toast.success('Blank page inserted')
    } catch {
      toast.error("Couldn't edit that PDF")
    } finally {
      setProcessing(false)
    }
  }

  const reset = () => {
    setFile(null)
    setAfterPage(0)
    setResultBlob(null)
  }

  return (
    <ToolPageLayout>
      <ToolPageHeader icon={tool.icon} title={tool.title} description={tool.description} />

      {resultBlob ? (
        <ResultCard
          title="Blank page added"
          description="A blank page was inserted into your PDF."
          onDownload={() => downloadBlob(resultBlob, `${baseFileName(file!.name)}-edited.pdf`)}
          onReset={reset}
        />
      ) : !file ? (
        <PdfDropzone onFilesAccepted={(files) => setFile(files[0]!)} />
      ) : (
        <>
          {loading && <p className="text-center text-sm text-ink-muted">Reading pages…</p>}
          {error && <p className="text-center text-sm text-error">{error}</p>}
          {doc && (
            <>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {Array.from({ length: pageCount }, (_, i) => (
                  <PageThumbnail key={i} doc={doc} pageNumber={i + 1} />
                ))}
              </div>
              <GlassCard className="flex flex-col gap-3 p-5">
                <Select
                  label="Insert position"
                  value={afterPage}
                  onChange={(event) => setAfterPage(Number(event.target.value))}
                  options={[
                    { value: '0', label: 'Before page 1' },
                    ...Array.from({ length: pageCount }, (_, i) => ({
                      value: String(i + 1),
                      label: `After page ${i + 1}`,
                    })),
                  ]}
                />
              </GlassCard>
              <Button className="self-center" loading={processing} onClick={() => void handleApply()}>
                Insert blank page
              </Button>
            </>
          )}
        </>
      )}
    </ToolPageLayout>
  )
}
