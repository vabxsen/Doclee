import { motion } from 'framer-motion'
import { Download, SlidersHorizontal, UploadCloud } from 'lucide-react'
import { staggerContainer, listItem } from '@/lib/motion'

const STEPS = [
  { icon: UploadCloud, title: 'Drop your images', description: 'PNG, JPG, WEBP, HEIC, and more — one page each, in any order.' },
  { icon: SlidersHorizontal, title: 'Edit and arrange', description: 'Crop, adjust, reorder, and set every PDF export detail.' },
  { icon: Download, title: 'Export instantly', description: 'A lossless, ready-to-share PDF, built entirely on your device.' },
]

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto mb-10 max-w-xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">How it works</h2>
      </div>
      <motion.div
        variants={staggerContainer(0.08)}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-3"
      >
        {STEPS.map((step, index) => (
          <motion.div key={step.title} variants={listItem} className="text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-white/8 text-ink">
              <step.icon className="size-6" />
            </div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Step {index + 1}
            </p>
            <h3 className="mb-1 text-base font-semibold text-ink">{step.title}</h3>
            <p className="mx-auto max-w-xs text-sm text-ink-muted">{step.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
