import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useAuthStore } from '@/store/useAuthStore'
import { shareOrDownloadPdf } from '@/utils/download'
import { markExported } from '@/hooks/useHasExported'

export type ExportStatus = 'idle' | 'building' | 'success' | 'error'

export interface ExportState {
  status: ExportStatus
  completed: number
  total: number
  errorMessage?: string
}

/** Best-effort: logs a lightweight history entry (name/date/page count/thumbnail) for signed-in users. Never blocks or fails the export itself. */
async function logHistoryEntry(fileName: string): Promise<void> {
  const user = useAuthStore.getState().user
  if (!user) return

  try {
    const { images } = useDocumentStore.getState()
    const firstImage = images[0]
    if (!firstImage) return

    const [{ createHistoryThumbnail }, { addProjectHistoryEntry }] = await Promise.all([
      import('@/services/projectHistory/createHistoryThumbnail'),
      import('@/services/projectHistory/projectHistoryService'),
    ])
    const thumbnailDataUrl = await createHistoryThumbnail(firstImage)
    if (!thumbnailDataUrl) return

    await addProjectHistoryEntry(user.uid, { fileName, pageCount: images.length, thumbnailDataUrl })
  } catch (error) {
    console.error('Failed to log export history', error)
  }
}

export function usePdfExport() {
  const [state, setState] = useState<ExportState>({ status: 'idle', completed: 0, total: 0 })

  const exportPdf = useCallback(async () => {
    const { images, pdfSettings } = useDocumentStore.getState()
    if (images.length === 0) {
      toast.error('Add at least one image first.')
      return
    }

    setState({ status: 'building', completed: 0, total: images.length })
    try {
      // pdf-lib is a sizeable dependency — deferred until the user actually exports.
      const { buildPdfDocument } = await import('@/services/pdf/buildPdfDocument')
      const bytes = await buildPdfDocument(images, pdfSettings, ({ completed, total }) => {
        setState((prev) => ({ ...prev, completed, total }))
      })
      const fileName = `${pdfSettings.metadata.title || 'doclee-document'}.pdf`
      await shareOrDownloadPdf(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), fileName)
      setState((prev) => ({ ...prev, status: 'success' }))
      markExported()
      toast.success('PDF exported')
      void logHistoryEntry(fileName)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed'
      setState((prev) => ({ ...prev, status: 'error', errorMessage: message }))
      toast.error(message)
    }
  }, [])

  const reset = useCallback(() => setState({ status: 'idle', completed: 0, total: 0 }), [])

  return { ...state, exportPdf, reset }
}
