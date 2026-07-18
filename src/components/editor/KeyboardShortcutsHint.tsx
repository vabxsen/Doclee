import { useState } from 'react'
import { Keyboard } from 'lucide-react'
import { IconButton } from '@/components/ui/IconButton'
import { Dialog } from '@/components/ui/Dialog'

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: 'Ctrl/Cmd + Z', label: 'Undo' },
  { keys: 'Ctrl/Cmd + Shift + Z', label: 'Redo' },
  { keys: 'Ctrl/Cmd + D', label: 'Duplicate page' },
  { keys: 'Delete', label: 'Delete page' },
  { keys: 'Ctrl/Cmd + E', label: 'Export PDF' },
]

export function KeyboardShortcutsHint() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <IconButton icon={<Keyboard className="size-4" />} label="Keyboard shortcuts" onClick={() => setOpen(true)} />
      <Dialog open={open} onClose={() => setOpen(false)} title="Keyboard shortcuts" size="sm">
        <ul className="flex flex-col gap-2.5">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.label} className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">{shortcut.label}</span>
              <kbd className="glass rounded-[8px] px-2 py-1 text-xs font-medium text-ink">{shortcut.keys}</kbd>
            </li>
          ))}
        </ul>
      </Dialog>
    </>
  )
}
