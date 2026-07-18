import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useImageDecoder } from '@/hooks/useImageDecoder'
import { UploadDropzone } from '@/components/editor/UploadDropzone'
import { Badge } from '@/components/ui/Badge'
import { staggerContainer, listItem, fadeInUp } from '@/lib/motion'

const SUPPORTED_LABELS = ['PNG', 'JPG', 'JPEG', 'WEBP', 'BMP', 'GIF', 'TIFF', 'HEIC', 'SVG']

export function HeroSection() {
  const { ingestFiles } = useImageDecoder()
  const navigate = useNavigate()

  const handleFiles = (files: File[]) => {
    void ingestFiles(files).then(() => navigate('/tools/image-to-pdf'))
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-10">
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mx-auto max-w-3xl text-center">
        <Badge tone="accent" className="mb-5">
          No account · Works offline · Installable
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
          Image to PDF, done beautifully.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-ink-muted sm:text-lg">
          Doclee turns your photos and scans into a pixel-perfect, lossless PDF — with full control
          over layout, quality, and every export detail.
        </p>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="mx-auto mt-10 max-w-2xl"
      >
        <UploadDropzone onFilesAccepted={handleFiles} />
      </motion.div>

      <motion.div
        variants={staggerContainer(0.04)}
        initial="initial"
        animate="animate"
        className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2"
      >
        {SUPPORTED_LABELS.map((label) => (
          <motion.span key={label} variants={listItem}>
            <Badge>{label}</Badge>
          </motion.span>
        ))}
      </motion.div>
    </section>
  )
}
