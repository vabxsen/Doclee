import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/lib/cn'
import { glideTransition } from '@/lib/motion'
import type { MotionSafeProps } from '@/lib/motionTypes'

interface PdfDropzoneProps {
  onFilesAccepted: (files: File[]) => void
  multiple?: boolean
  label?: string
  hint?: string
  className?: string
  /** Defaults to PDF-only; pass a react-dropzone accept map to accept other file types. */
  accept?: Record<string, string[]>
  /** Shown after the hint, e.g. "PDF" or "DOCX". */
  fileTypeLabel?: string
}

export function PdfDropzone({
  onFilesAccepted,
  multiple = false,
  label = 'Drop a PDF here',
  hint = 'or click to browse',
  className,
  accept = { 'application/pdf': ['.pdf'] },
  fileTypeLabel = 'PDF',
}: PdfDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFilesAccepted(accepted)
    },
    [onFilesAccepted],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
  })
  const rootProps = getRootProps() as MotionSafeProps<ReturnType<typeof getRootProps>>

  return (
    <motion.div
      {...rootProps}
      whileHover={{ scale: 1.005 }}
      transition={glideTransition}
      className={cn(
        'glass flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-dashed p-12 text-center transition-colors',
        isDragActive && 'bg-glass-strong border-white/20',
        className,
      )}
    >
      <input {...getInputProps()} />
      <motion.span
        animate={isDragActive ? { y: -4 } : { y: 0 }}
        transition={glideTransition}
        className="flex size-14 items-center justify-center rounded-full bg-white/8 text-ink"
      >
        <UploadCloud className="size-6" />
      </motion.span>
      <div>
        <p className="text-base font-semibold text-ink">{isDragActive ? 'Drop to add' : label}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {hint} — {fileTypeLabel}
          {multiple ? ' files' : ''}
        </p>
      </div>
    </motion.div>
  )
}
