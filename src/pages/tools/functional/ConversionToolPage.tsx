import { useState } from 'react'
import { toast } from 'sonner'
import { ToolPageHeader } from '@/components/tools/ToolPageHeader'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { PdfDropzone } from '@/components/tools/PdfDropzone'
import { ResultCard } from '@/components/tools/ResultCard'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { downloadBlob } from '@/utils/download'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'
import { convertFile, getSourceAcceptForSlug } from '@/services/conversion/converterClient'

interface ConversionToolPageProps {
  slug: string
  /** Shown in the dropzone hint and file-type label, e.g. "DOCX" or "PPTX". */
  sourceLabel: string
}

/**
 * Shared page for every Office <-> PDF conversion tool (word/ppt/excel to
 * PDF, pdf to word) — they all do the same thing: pick a file, POST it to
 * the converter service via convertFile, download the result.
 */
export function ConversionToolPage({ slug, sourceLabel }: ConversionToolPageProps) {
  const tool = getToolBySlug(slug)!
  const [file, setFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [result, setResult] = useState<{ blob: Blob; fileName: string } | null>(null)

  const sourceAccept = getSourceAcceptForSlug(slug)

  const handleConvert = async () => {
    if (!file) return
    setConverting(true)
    const response = await convertFile(slug, file)
    setConverting(false)
    if (response.ok && response.blob && response.fileName) {
      setResult({ blob: response.blob, fileName: response.fileName })
      toast.success(response.message)
    } else {
      toast.error(response.message)
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
  }

  return (
    <ToolPageLayout>
      <ToolPageHeader icon={tool.icon} title={tool.title} description={tool.description} />

      {result ? (
        <ResultCard
          title="Conversion complete"
          description={result.fileName}
          onDownload={(fileName) => downloadBlob(result.blob, fileName)}
          onReset={reset}
          resultBlob={result.blob}
          resultFileName={result.fileName}
        />
      ) : !file ? (
        <PdfDropzone
          onFilesAccepted={(files) => setFile(files[0]!)}
          accept={sourceAccept}
          fileTypeLabel={sourceLabel}
          label={`Drop a ${sourceLabel} file here`}
        />
      ) : (
        <>
          <GlassCard className="flex items-center justify-between gap-3 p-4">
            <p className="min-w-0 truncate text-sm text-ink">{file.name}</p>
            <Button variant="secondary" size="sm" onClick={reset}>
              Change file
            </Button>
          </GlassCard>
          <Button className="self-center" loading={converting} onClick={() => void handleConvert()}>
            Convert
          </Button>
        </>
      )}
    </ToolPageLayout>
  )
}
