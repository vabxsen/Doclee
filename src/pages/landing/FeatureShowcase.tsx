import { motion } from 'framer-motion'
import { Gauge, Layers, SlidersHorizontal, ShieldCheck, WifiOff, Wand2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { staggerContainer, listItem } from '@/lib/motion'

const FEATURES = [
  {
    icon: Gauge,
    title: 'Uncompromising quality',
    description: 'Lossless by default — PNG embedding with real DPI control, never silently compressed.',
  },
  {
    icon: Layers,
    title: 'Full page control',
    description: 'Drag to reorder, duplicate, delete, and rotate pages with instant visual feedback.',
  },
  {
    icon: SlidersHorizontal,
    title: 'A real photo editor',
    description: 'Crop, rotate, flip, and fine-tune brightness, contrast, sharpness, and more per page.',
  },
  {
    icon: ShieldCheck,
    title: 'Every export detail',
    description: 'Page size, margins, fit, alignment, watermark, page numbers, and metadata — all yours to set.',
  },
  {
    icon: WifiOff,
    title: 'Private by design',
    description: 'No account, no upload to a server. Everything runs on your device, even offline.',
  },
  {
    icon: Wand2,
    title: 'Built to feel great',
    description: 'A fast, animated, keyboard-friendly workspace — not a clunky utility form.',
  },
]

export function FeatureShowcase() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto mb-10 max-w-xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Everything a great converter should be
        </h2>
      </div>
      <motion.div
        variants={staggerContainer(0.06)}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((feature) => (
          <motion.div key={feature.title} variants={listItem}>
            <GlassCard hoverable className="flex h-full flex-col gap-3 p-6">
              <span className="flex size-10 items-center justify-center rounded-[12px] bg-white/8 text-ink">
                <feature.icon className="size-5" />
              </span>
              <h3 className="text-base font-semibold text-ink">{feature.title}</h3>
              <p className="text-sm text-ink-muted">{feature.description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
