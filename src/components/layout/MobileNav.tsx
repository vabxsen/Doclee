import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { glideTransition } from '@/lib/motion'
import { IconButton } from '@/components/ui/IconButton'
import { TOOLS_REGISTRY, TOOL_CATEGORY_LABELS } from '@/pages/tools/toolsRegistry'
import { Badge } from '@/components/ui/Badge'
import type { ToolCategory } from '@/types/tool'

const CATEGORY_ORDER: ToolCategory[] = ['convert', 'organize', 'edit', 'security', 'scan', 'ai']

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="glass-strong fixed inset-0 z-50 overflow-y-auto md:hidden"
        >
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={glideTransition}
            className="mx-auto flex min-h-full max-w-lg flex-col gap-6 px-5 pb-24 pt-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-ink">Tools</span>
              <IconButton icon={<X className="size-4" />} label="Close" onClick={onClose} />
            </div>

            {CATEGORY_ORDER.map((category) => {
              const tools = TOOLS_REGISTRY.filter((tool) => tool.category === category)
              if (tools.length === 0) return null
              return (
                <div key={category}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {TOOL_CATEGORY_LABELS[category]}
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {tools.map((tool) => (
                      <li key={tool.slug}>
                        <Link
                          to={`/tools/${tool.slug}`}
                          onClick={onClose}
                          className="focus-ring flex items-center gap-2.5 rounded-[12px] px-2.5 py-2.5 text-sm text-ink-muted transition-colors hover:bg-white/6 hover:text-ink"
                        >
                          <tool.icon className="size-4 shrink-0" />
                          <span className="truncate">{tool.title}</span>
                          {tool.status === 'coming-soon' && (
                            <Badge tone="neutral" className="ml-auto shrink-0 text-[10px]">
                              Soon
                            </Badge>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
