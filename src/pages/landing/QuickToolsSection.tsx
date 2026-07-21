import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'
import { GlassCard } from '@/components/ui/GlassCard'
import { staggerContainer, listItem } from '@/lib/motion'

const QUICK_TOOL_SLUGS = [
  'document-scanner',
  'pdf-to-image',
  'merge-pdf',
  'lock-pdf',
  'unlock-pdf',
  'watermark-pdf',
]

/**
 * Mobile-only quick access to a handful of popular tools — the full tools
 * grid is desktop-only, and the bottom nav's Tools tab covers the rest.
 */
export function QuickToolsSection() {
  const tools = QUICK_TOOL_SLUGS.map(getToolBySlug).filter((tool) => tool !== undefined)

  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-12 sm:px-6 md:hidden">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-ink">Quick tools</h2>
      <motion.div
        variants={staggerContainer(0.03)}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-2 gap-3"
      >
        {tools.map((tool) => (
          <motion.div key={tool.slug} variants={listItem}>
            <Link to={`/tools/${tool.slug}`}>
              <GlassCard hoverable className="flex items-center gap-3 p-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white/8 text-ink">
                  <tool.icon className="size-4" />
                </span>
                <p className="min-w-0 truncate text-sm font-medium text-ink">{tool.title}</p>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
