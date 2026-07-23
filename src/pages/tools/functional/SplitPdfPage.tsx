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
import { useLoadedPdf } from '@/hooks/useLoadedPdf'
import { parsePageRangeGroups } from '@/lib/pageRanges'
import { baseFileName } from '@/services/pdf/pdfFileIO'
import { downloadFileOrZip } from '@/utils/zipDownload'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'

const tool = getToolBySlug('split-pdf')!

export function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [ranges, setRanges] = useState('')
  const [splitting, setSplitting] = useState(false)
  const [resultCount, setResultCount] = useState<number | null>(null)
  const [pendingEntries, setPendingEntries] = useState<{ name: string; blob: Blob }[] | null>(null)
  const { doc, pageCount, loading, error } = useLoadedPdf(file)

  const handleSplit = async () => {
    if (!file || pageCount === 0) return
    const groups = parsePageRangeGroups(ranges || `1-${pageCount}`, pageCount)
    if (!groups) {
      toast.error(`Enter valid page ranges between 1 and ${pageCount}, e.g. "1-3, 4-6"`)
      return
    }
    setSplitting(true)
    try {
      const bytes = await file.arrayBuffer()
      const source = await PDFDocument.load(bytes)
      const base = baseFileName(file.name)
      const entries: { name: string; blob: Blob }[] = []
      for (let i = 0; i < groups.length; i++) {
        const out = await PDFDocument.create()
        const copied = await out.copyPages(source, groups[i]!)
        copied.forEach((page) => out.addPage(page))
        const outBytes = await out.save()
        entries.push({
          name: `${base}-part-${i + 1}.pdf`,
          blob: new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' }),
        })
      }
      setPendingEntries(entries)
      setResultCount(entries.length)
      toast.success(`Split into ${entries.length} file${entries.length === 1 ? '' : 's'}`)
    } catch {
      toast.error("Couldn't split that PDF")
    } finally {
      setSplitting(false)
    }
  }

  const reset = () => {
    setFile(null)
    setRanges('')
    setResultCount(null)
    setPendingEntries(null)
  }

  return (
    <ToolPageLayout>
      <ToolPageHeader icon={tool.icon} title={tool.title} description={tool.description} />

      {resultCount !== null && pendingEntries ? (
        <ResultCard
          title="Split complete"
          description={`Created ${resultCount} PDF${resultCount === 1 ? '' : 's'}.`}
          downloadLabel={resultCount > 1 ? 'Download .zip' : 'Download'}
          onDownload={(fileName) => void downloadFileOrZip(pendingEntries, fileName)}
          onReset={reset}
          resultBlob={pendingEntries[0]?.blob}
          resultFileName={
            resultCount === 1 ? pendingEntries[0]!.name : `${baseFileName(file!.name)}-split.zip`
          }
          resultPageCount={resultCount}
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
                <label className="text-xs font-medium text-ink-muted" htmlFor="ranges">
                  Page ranges (leave blank to split every page into its own file)
                </label>
                <input
                  id="ranges"
                  value={ranges}
                  onChange={(event) => setRanges(event.target.value)}
                  placeholder={`e.g. 1-3, 4-6 — this PDF has ${pageCount} pages`}
                  className="focus-ring glass h-10 w-full rounded-[14px] px-3 text-sm text-ink placeholder:text-ink-muted/60"
                />
              </GlassCard>
              <Button className="self-center" loading={splitting} onClick={() => void handleSplit()}>
                Split PDF
              </Button>
            </>
          )}
        </>
      )}
    </ToolPageLayout>
  )
}
