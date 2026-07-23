import { motion } from 'framer-motion'
import { UploadDropzone } from '@/components/editor/UploadDropzone'
import { Badge } from '@/components/ui/Badge'
import { useImageDecoder } from '@/hooks/useImageDecoder'
import { staggerContainer, listItem, fadeInUp } from '@/lib/motion'
import { SUPPORTED_IMAGE_LABELS } from '@/lib/constants'

export function EditorEmptyState() {
  const { ingestFiles } = useImageDecoder()

  return (
    // Top-anchored, matching every other tool page's layout — vertically
    // centering this in the exact middle of the viewport (the old approach)
    // left large dead margins above and below on phones, making it feel like
    // a small card floating in an empty screen rather than a real page.
    <div className="mx-auto max-w-xl px-4 py-6 sm:py-14">
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <h1 className="mb-1 text-center text-2xl font-semibold tracking-tight text-ink">
          Start a new PDF
        </h1>
        <p className="mb-6 text-center text-sm text-ink-muted">
          Drop in your images — you can reorder, edit, and export right after.
        </p>
        <UploadDropzone onFilesAccepted={ingestFiles} />
      </motion.div>

      <motion.div
        variants={staggerContainer(0.04)}
        initial="initial"
        animate="animate"
        className="mt-6 flex flex-wrap justify-center gap-2"
      >
        {SUPPORTED_IMAGE_LABELS.map((label) => (
          <motion.span key={label} variants={listItem}>
            <Badge>{label}</Badge>
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}
