import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, Minus, Plus, Redo2, SlidersHorizontal, Trash2, Undo2 } from 'lucide-react'
import { IconButton } from '@/components/ui/IconButton'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useUiStore } from '@/store/useUiStore'
import { useUndoRedo } from '@/hooks/useUndoRedo'
import { useAutosave } from '@/hooks/useAutosave'
import { Spinner } from '@/components/ui/Spinner'
import { clamp } from '@/utils/clamp'
import { KeyboardShortcutsHint } from '@/components/editor/KeyboardShortcutsHint'

export function EditorTopToolbar() {
  const { undo, redo, canUndo, canRedo } = useUndoRedo()
  const activeImageId = useDocumentStore((state) => state.activeImageId)
  const removeImage = useDocumentStore((state) => state.removeImage)
  const duplicateImage = useDocumentStore((state) => state.duplicateImage)
  const zoom = useUiStore((state) => state.zoom)
  const setZoom = useUiStore((state) => state.setZoom)
  const isMobileSettingsOpen = useUiStore((state) => state.isMobileSettingsOpen)
  const setMobileSettingsOpen = useUiStore((state) => state.setMobileSettingsOpen)
  const autosaveStatus = useAutosave()

  return (
    <div className="glass flex h-14 shrink-0 items-center justify-between border-x-0 border-t-0 px-4">
      <div className="flex items-center gap-1">
        <IconButton icon={<Undo2 className="size-4" />} label="Undo" disabled={!canUndo} onClick={undo} />
        <IconButton icon={<Redo2 className="size-4" />} label="Redo" disabled={!canRedo} onClick={redo} />
        <div className="mx-2 h-5 w-px bg-border-glass" />
        <IconButton
          icon={<Copy className="size-4" />}
          label="Duplicate page"
          disabled={!activeImageId}
          onClick={() => activeImageId && duplicateImage(activeImageId)}
        />
        <IconButton
          icon={<Trash2 className="size-4" />}
          label="Delete page"
          disabled={!activeImageId}
          onClick={() => activeImageId && removeImage(activeImageId)}
        />
      </div>

      <div className="flex items-center gap-3">
        <AnimatePresence>
          {autosaveStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="hidden items-center gap-1.5 text-xs text-ink-muted sm:flex"
            >
              {autosaveStatus === 'saving' ? (
                <Spinner size={12} />
              ) : (
                <Check className="size-3.5 text-success" />
              )}
              {autosaveStatus === 'saving' ? 'Saving…' : 'Saved'}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden items-center gap-1 md:flex">
          <IconButton
            icon={<Minus className="size-3.5" />}
            label="Zoom out"
            onClick={() => setZoom(clamp(zoom - 0.1, 0.3, 3))}
          />
          <span className="w-10 text-center text-xs tabular-nums text-ink-muted">
            {Math.round(zoom * 100)}%
          </span>
          <IconButton
            icon={<Plus className="size-3.5" />}
            label="Zoom in"
            onClick={() => setZoom(clamp(zoom + 0.1, 0.3, 3))}
          />
        </div>
        <div className="hidden h-5 w-px bg-border-glass md:block" />
        <div className="hidden md:block">
          <KeyboardShortcutsHint />
        </div>
        <IconButton
          icon={<SlidersHorizontal className="size-4" />}
          label="Edit"
          active={isMobileSettingsOpen}
          onClick={() => setMobileSettingsOpen(!isMobileSettingsOpen)}
          className="md:hidden"
        />
      </div>
    </div>
  )
}
