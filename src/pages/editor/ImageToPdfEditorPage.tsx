import { useDocumentStore } from '@/store/useDocumentStore'
import { usePdfExport } from '@/hooks/usePdfExport'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { SEO } from '@/components/shared/SEO'
import { EditorEmptyState } from '@/pages/editor/EditorEmptyState'
import { ImageWorkspace } from '@/components/editor/ImageWorkspace'

export function ImageToPdfEditorPage() {
  const imageCount = useDocumentStore((state) => state.images.length)
  const activeImageId = useDocumentStore((state) => state.activeImageId)
  const undo = useDocumentStore((state) => state.undo)
  const redo = useDocumentStore((state) => state.redo)
  const duplicateImage = useDocumentStore((state) => state.duplicateImage)
  const removeImage = useDocumentStore((state) => state.removeImage)
  const exportState = usePdfExport()

  useKeyboardShortcuts([
    { key: 'z', meta: true, handler: undo },
    { key: 'z', meta: true, shift: true, handler: redo },
    { key: 'd', meta: true, handler: () => activeImageId && duplicateImage(activeImageId) },
    { key: 'Delete', handler: () => activeImageId && removeImage(activeImageId) },
    { key: 'Backspace', handler: () => activeImageId && removeImage(activeImageId) },
    { key: 'e', meta: true, handler: () => void exportState.exportPdf() },
  ])

  return (
    <>
      <SEO
        title="Image to PDF"
        description="Convert images into a pixel-perfect, lossless PDF — no account, works offline."
      />
      {imageCount === 0 ? <EditorEmptyState /> : <ImageWorkspace exportState={exportState} />}
    </>
  )
}
