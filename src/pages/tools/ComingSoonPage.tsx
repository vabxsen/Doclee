import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { ArrowLeft, Sparkles, UploadCloud } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { SEO } from '@/components/shared/SEO'
import { Badge } from '@/components/ui/Badge'
import { LinkButton } from '@/components/ui/LinkButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { BottomNavSpacer } from '@/components/layout/BottomNavSpacer'
import type { MotionSafeProps } from '@/lib/motionTypes'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'
import { convertFile, getSourceAcceptForSlug } from '@/services/conversion/converterClient'
import { downloadBlob } from '@/utils/download'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function ComingSoonPage() {
  const { slug } = useParams<{ slug: string }>()
  const tool = slug ? getToolBySlug(slug) : undefined
  const [pending, setPending] = useState(false)

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!tool || files.length === 0) return
      setPending(true)
      const result = await convertFile(tool.slug, files[0]!)
      setPending(false)
      if (result.ok) {
        toast.success(result.message)
        if (result.blob && result.fileName) downloadBlob(result.blob, result.fileName)
      } else {
        toast.error(result.message)
      }
    },
    [tool],
  )

  const sourceAccept = tool ? getSourceAcceptForSlug(tool.slug) : undefined

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: sourceAccept,
    multiple: false,
    disabled: pending,
  })

  if (!tool) return <NotFoundPage />

  const Icon = tool.icon
  const isConverterDemo = tool.backendNeed === 'backend' && Boolean(sourceAccept)

  return (
    <>
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
        <SEO title={tool.title} description={tool.description} />

        <Link
          to="/"
          state={{ openTools: true }}
          className="focus-ring mb-6 flex w-fit items-center gap-1.5 self-start rounded-[10px] px-1 py-1 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <span className="flex size-16 items-center justify-center rounded-full bg-white/8 text-ink">
          <Icon className="size-7" />
        </span>

        <div className="mt-5 flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{tool.title}</h1>
          <Badge tone="accent">Coming Soon</Badge>
        </div>
        <p className="mt-2 max-w-md text-sm text-ink-muted">{tool.description}</p>

        {tool.followUpNote && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-muted">
            <Sparkles className="size-3.5" />
            {tool.followUpNote}
          </p>
        )}

        {isConverterDemo && (
          <GlassCard
            {...(getRootProps() as MotionSafeProps<ReturnType<typeof getRootProps>>)}
            className={`mt-8 flex w-full cursor-pointer flex-col items-center gap-3 border-dashed p-8 transition-colors ${
              isDragActive ? 'bg-glass-strong' : ''
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="size-6 text-ink-muted" />
            <p className="text-sm text-ink-muted">
              {pending ? 'Converting…' : 'Drop a file here, or click to browse, to try the real converter'}
            </p>
            <p className="text-xs text-ink-muted/70">
              Runs on a LibreOffice Cloud Run service — only works once that service is deployed.
            </p>
          </GlassCard>
        )}

        <div className="mt-10 flex gap-3">
          <LinkButton to="/tools/image-to-pdf" variant="primary">
            Try Image to PDF instead
          </LinkButton>
          <LinkButton to="/" variant="secondary">
            Back home
          </LinkButton>
        </div>
      </div>
      <BottomNavSpacer />
    </>
  )
}
