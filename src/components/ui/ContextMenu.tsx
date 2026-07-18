import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { snapTransition } from '@/lib/motion'
import type { MenuItemDef } from '@/components/ui/DropdownMenu'

interface ContextMenuProps {
  items: MenuItemDef[]
  children: ReactNode
  className?: string
}

export function ContextMenu({ items, children, className }: ContextMenuProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!position) return
    const close = () => setPosition(null)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('scroll', close, true)
    }
  }, [position])

  return (
    <div
      className={className}
      onContextMenu={(event) => {
        event.preventDefault()
        setPosition({ top: event.clientY, left: event.clientX })
      }}
    >
      {children}
      {createPortal(
        <AnimatePresence>
          {position && (
            <motion.div
              ref={menuRef}
              role="menu"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={snapTransition}
              style={{ position: 'fixed', top: position.top, left: position.left }}
              className="glass-strong z-50 min-w-[180px] rounded-[16px] p-1.5"
              onPointerDown={(event) => event.stopPropagation()}
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    item.onSelect()
                    setPosition(null)
                  }}
                  className={cn(
                    'focus-ring flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                    item.danger ? 'text-error hover:bg-error/10' : 'text-ink hover:bg-white/8',
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
