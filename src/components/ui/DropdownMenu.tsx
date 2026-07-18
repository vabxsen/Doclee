import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { snapTransition } from '@/lib/motion'

export interface MenuItemDef {
  label: string
  icon?: ReactNode
  onSelect: () => void
  danger?: boolean
  disabled?: boolean
}

interface DropdownMenuProps {
  trigger: ReactNode
  items: MenuItemDef[]
  align?: 'start' | 'end'
}

export function DropdownMenu({ trigger, items, align = 'end' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      setOpen(false)
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

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      setPosition({
        top: rect.bottom + 8,
        left: align === 'end' ? rect.right : rect.left,
      })
    }
    setOpen((value) => !value)
  }

  return (
    <>
      <div ref={triggerRef} onClick={openMenu}>
        {trigger}
      </div>
      {createPortal(
        <AnimatePresence>
          {open && position && (
            <motion.div
              ref={menuRef}
              role="menu"
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={snapTransition}
              style={{
                position: 'fixed',
                top: position.top,
                left: align === 'end' ? undefined : position.left,
                right: align === 'end' ? window.innerWidth - position.left : undefined,
              }}
              className="glass-strong z-50 min-w-[180px] rounded-[16px] p-1.5"
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    item.onSelect()
                    setOpen(false)
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
    </>
  )
}
