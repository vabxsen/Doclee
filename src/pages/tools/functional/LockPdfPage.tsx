import { useState } from 'react'
import { PDFDocument } from '@cantoo/pdf-lib'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock } from 'lucide-react'
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

const tool = getToolBySlug('lock-pdf')!

export function LockPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)

  const handleApply = async () => {
    if (!file || !password) return
    setProcessing(true)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      pdf.encrypt({ userPassword: password, ownerPassword: password })
      const outBytes = await pdf.save()
      setResultBlob(new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' }))
      toast.success('PDF locked')
    } catch {
      toast.error("Couldn't lock that PDF — make sure it's a valid, unencrypted file")
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
          title="PDF locked"
          description="Anyone opening this file will need the password you set."
          onDownload={() => downloadBlob(resultBlob, `${baseFileName(file!.name)}-locked.pdf`)}
          onReset={reset}
          resultBlob={resultBlob}
          resultFileName={`${baseFileName(file!.name)}-locked.pdf`}
        />
      ) : !file ? (
        <PdfDropzone onFilesAccepted={(files) => setFile(files[0]!)} />
      ) : (
        <>
          <GlassCard className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-ink-muted" htmlFor="lock-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="lock-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Choose a password"
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
                Nothing leaves your browser — the PDF is encrypted locally.
              </p>
            </div>
          </GlassCard>
          <Button
            className="self-center"
            leadingIcon={<Lock className="size-3.5" />}
            disabled={!password}
            loading={processing}
            onClick={() => void handleApply()}
          >
            Lock PDF
          </Button>
        </>
      )}
    </ToolPageLayout>
  )
}
