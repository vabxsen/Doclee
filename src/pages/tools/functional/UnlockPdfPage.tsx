import { useState } from 'react'
import { PDFDocument } from '@cantoo/pdf-lib'
import { toast } from 'sonner'
import { Eye, EyeOff, Unlock } from 'lucide-react'
import { ToolPageHeader } from '@/components/tools/ToolPageHeader'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { PdfDropzone } from '@/components/tools/PdfDropzone'
import { ResultCard } from '@/components/tools/ResultCard'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { IconButton } from '@/components/ui/IconButton'
import { baseFileName } from '@/services/pdf/pdfFileIO'
import { downloadBlob } from '@/utils/download'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'

const tool = getToolBySlug('unlock-pdf')!

export function UnlockPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)

  const handleApply = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const bytes = await file.arrayBuffer()
      const source = await PDFDocument.load(bytes, { password: password || undefined })
      // Saving the decrypted document directly can leave a stale /Encrypt
      // trailer entry behind (a bug in @cantoo/pdf-lib's cross-ref-stream
      // writer) — copying pages into a fresh, never-encrypted document
      // sidesteps it entirely.
      const output = await PDFDocument.create()
      const copiedPages = await output.copyPages(source, source.getPageIndices())
      copiedPages.forEach((page) => output.addPage(page))
      const outBytes = await output.save()
      setResultBlob(new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' }))
      toast.success('PDF unlocked')
    } catch {
      toast.error("Couldn't unlock that PDF — check the password and try again")
    } finally {
      setProcessing(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPassword('')
    setResultBlob(null)
  }

  return (
    <ToolPageLayout>
      <ToolPageHeader icon={tool.icon} title={tool.title} description={tool.description} />

      {resultBlob ? (
        <ResultCard
          title="PDF unlocked"
          description="The password has been removed — anyone can open it now."
          onDownload={() => downloadBlob(resultBlob, `${baseFileName(file!.name)}-unlocked.pdf`)}
          onReset={reset}
        />
      ) : !file ? (
        <PdfDropzone onFilesAccepted={(files) => setFile(files[0]!)} />
      ) : (
        <>
          <GlassCard className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-ink-muted" htmlFor="unlock-password">
                Current password
              </label>
              <div className="relative">
                <input
                  id="unlock-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter the PDF's password"
                  className="focus-ring glass h-10 w-full rounded-[14px] px-3 pr-11 text-sm text-ink"
                />
                <IconButton
                  label={showPassword ? 'Hide password' : 'Show password'}
                  icon={showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
                />
              </div>
              <p className="text-xs text-ink-muted">
                Processed entirely in your browser — the file and password never leave this device.
              </p>
            </div>
          </GlassCard>
          <Button
            className="self-center"
            leadingIcon={<Unlock className="size-3.5" />}
            loading={processing}
            onClick={() => void handleApply()}
          >
            Unlock PDF
          </Button>
        </>
      )}
    </ToolPageLayout>
  )
}
