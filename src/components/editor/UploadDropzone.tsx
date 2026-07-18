import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/lib/cn'
import { glideTransition } from '@/lib/motion'
import type { MotionSafeProps } from '@/lib/motionTypes'
import { SUPPORTED_IMAGE_MIME_TYPES } from '@/lib/constants'

interface UploadDropzoneProps {
  onFilesAccepted: (files: File[]) => void
  className?: string
  compact?: boolean
}

const ACCEPT = SUPPORTED_IMAGE_MIME_TYPES.reduce<Record<string, string[]>>((acc, mime) => {
  acc[mime] = []
  return acc
}, {})

export function UploadDropzone({ onFilesAccepted, className, compact = false }: UploadDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFilesAccepted(accepted)
    },
    [onFilesAccepted],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: true,
  })
  const rootProps = getRootProps() as MotionSafeProps<ReturnType<typeof getRootProps>>

  return (
    <motion.div
      {...rootProps}
      whileHover={{ scale: 1.005 }}
      transition={glideTransition}
      className={cn(
        'glass flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-dashed text-center transition-colors',
        compact ? 'p-8' : 'p-16',
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
        <p className="text-base font-semibold text-ink">
          {isDragActive ? 'Drop to add' : 'Drop your images here'}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          or click to browse — PNG, JPG, WEBP, BMP, GIF, TIFF, HEIC, SVG
        </p>
      </div>
    </motion.div>
  )
}
