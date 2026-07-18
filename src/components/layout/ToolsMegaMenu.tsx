import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { snapTransition } from '@/lib/motion'
import { TOOLS_REGISTRY, TOOL_CATEGORY_LABELS } from '@/pages/tools/toolsRegistry'
import { Badge } from '@/components/ui/Badge'
import type { ToolCategory } from '@/types/tool'

const CATEGORY_ORDER: ToolCategory[] = ['convert', 'organize', 'edit', 'security', 'scan', 'ai']

export function ToolsMegaMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'focus-ring flex items-center gap-1 rounded-[10px] px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink',
          open && 'text-ink',
        )}
        aria-expanded={open}
      >
        All Tools
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={snapTransition}
            className="glass-strong absolute left-1/2 top-full z-50 mt-3 w-[min(90vw,760px)] -translate-x-1/2 rounded-dialog p-6"
          >
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
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
                            onClick={() => setOpen(false)}
                            className="focus-ring flex items-center gap-2 rounded-[10px] px-2 py-1.5 text-sm text-ink-muted transition-colors hover:bg-white/6 hover:text-ink"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
