import { motion } from 'framer-motion'
import { UploadDropzone } from '@/components/editor/UploadDropzone'
import { useImageDecoder } from '@/hooks/useImageDecoder'
import { fadeInUp } from '@/lib/motion'

export function EditorEmptyState() {
  const { ingestFiles } = useImageDecoder()

  return (
    <div className="flex h-[calc(100svh-8rem)] items-center justify-center px-4 md:h-[calc(100svh-4rem)]">
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="w-full max-w-xl">
        <h1 className="mb-1 text-center text-2xl font-semibold tracking-tight text-ink">
          Start a new PDF
        </h1>
        <p className="mb-6 text-center text-sm text-ink-muted">
          Drop in your images — you can reorder, edit, and export right after.
        </p>
        <UploadDropzone onFilesAccepted={ingestFiles} />
      </motion.div>
    </div>
  )
}
