import { useDocumentStore } from '@/store/useDocumentStore'

export function useUndoRedo() {
  const undo = useDocumentStore((state) => state.undo)
  const redo = useDocumentStore((state) => state.redo)
  const canUndo = useDocumentStore((state) => state.undoStack.length > 0)
  const canRedo = useDocumentStore((state) => state.redoStack.length > 0)

  return { undo, redo, canUndo, canRedo }
}
