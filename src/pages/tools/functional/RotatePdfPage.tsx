import { useCallback, useState } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import { toast } from 'sonner'
import { RotateCw } from 'lucide-react'
import { ToolPageHeader } from '@/components/tools/ToolPageHeader'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { PdfDropzone } from '@/components/tools/PdfDropzone'
import { PageThumbnail } from '@/components/tools/PageThumbnail'
import { ResultCard } from '@/components/tools/ResultCard'
import { Button } from '@/components/ui/Button'
import { useLoadedPdf } from '@/hooks/useLoadedPdf'
import { baseFileName } from '@/services/pdf/pdfFileIO'
import { downloadBlob } from '@/utils/download'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'

const tool = getToolBySlug('rotate-pdf')!

export function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [rotations, setRotations] = useState<Record<number, number>>({})
  const [processing, setProcessing] = useState(false)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const { doc, pageCount, loading, error } = useLoadedPdf(file)

  const rotatePage = useCallback((pageNumber: number) => {
    const index = pageNumber - 1
    setRotations((prev) => ({ ...prev, [index]: ((prev[index] ?? 0) + 90) % 360 }))
  }, [])

  const rotateAll = () => {
    setRotations(() => {
      const next: Record<number, number> = {}
      for (let i = 0; i < pageCount; i++) next[i] = ((rotations[i] ?? 0) + 90) % 360
      return next
    })
  }

  const handleApply = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const pages = pdf.getPages()
      pages.forEach((page, index) => {
        const delta = rotations[index] ?? 0
        if (delta === 0) return
        const current = page.getRotation().angle
        page.setRotation(degrees((current + delta) % 360))
      })
      const outBytes = await pdf.save()
      setResultBlob(new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' }))
      toast.success('Pages rotated')
    } catch {
      toast.error("Couldn't rotate that PDF")
    } finally {
      setProcessing(false)
    }
  }

  const reset = () => {
    setFile(null)
    setRotations({})
    setResultBlob(null)
  }

  const anyRotated = Object.values(rotations).some((deg) => deg !== 0)

  return (
    <ToolPageLayout>
      <ToolPageHeader icon={tool.icon} title={tool.title} description={tool.description} />

      {resultBlob ? (
        <ResultCard
          title="Rotation applied"
          description="Your pages have been rotated."
          onDownload={(fileName) => downloadBlob(resultBlob, fileName)}
          onReset={reset}
          resultBlob={resultBlob}
          resultFileName={`${baseFileName(file!.name)}-rotated.pdf`}
        />
      ) : !file ? (
        <PdfDropzone onFilesAccepted={(files) => setFile(files[0]!)} />
      ) : (
        <>
          {loading && <p className="text-center text-sm text-ink-muted">Reading pages…</p>}
          {error && <p className="text-center text-sm text-error">{error}</p>}
          {doc && (
            <>
              <div className="flex justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  leadingIcon={<RotateCw className="size-3.5" />}
                  onClick={rotateAll}
                >
                  Rotate all pages
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {Array.from({ length: pageCount }, (_, i) => (
                  <PageThumbnail
                    key={i}
                    doc={doc}
                    pageNumber={i + 1}
                    rotationDeg={rotations[i] ?? 0}
                    onClick={rotatePage}
                    cornerIcon={RotateCw}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-ink-muted">Click a page to rotate it 90°.</p>
              <Button
                className="self-center"
                disabled={!anyRotated}
                loading={processing}
                onClick={() => void handleApply()}
              >
                Apply rotation
              </Button>
            </>
          )}
        </>
      )}
    </ToolPageLayout>
  )
}
