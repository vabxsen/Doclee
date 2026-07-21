import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TOOLS_REGISTRY } from '@/pages/tools/toolsRegistry'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { staggerContainer, listItem } from '@/lib/motion'

export function ToolsGridSection() {
  return (
    // Hidden on mobile — the bottom nav's Tools tab already covers discovery there.
    <section id="tools" className="mx-auto hidden max-w-[1400px] px-4 py-16 sm:px-6 md:block lg:px-10">
      <div className="mx-auto mb-10 max-w-xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Every tool, one app</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Image to PDF is fully built today. Everything else is on its way.
        </p>
      </div>
      <motion.div
        variants={staggerContainer(0.03)}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        {TOOLS_REGISTRY.map((tool) => (
          <motion.div key={tool.slug} variants={listItem}>
            <Link to={`/tools/${tool.slug}`}>
              <GlassCard hoverable className="flex h-full flex-col gap-2.5 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-[10px] bg-white/8 text-ink">
                    <tool.icon className="size-4" />
                  </span>
                  {tool.status === 'coming-soon' && (
                    <Badge tone="neutral" className="text-[10px]">
                      Soon
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-ink">{tool.title}</p>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
