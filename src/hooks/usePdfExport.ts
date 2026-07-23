import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useAuthStore } from '@/store/useAuthStore'
import { downloadBlob, shareBlob } from '@/utils/download'
import { markExported } from '@/hooks/useHasExported'

export type ExportStatus = 'idle' | 'building' | 'success' | 'error'

export interface ExportState {
  status: ExportStatus
  completed: number
  total: number
  errorMessage?: string
  resultBlob?: Blob
  resultFileName?: string
}

const IDLE_STATE: ExportState = { status: 'idle', completed: 0, total: 0 }

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
  const [state, setState] = useState<ExportState>(IDLE_STATE)

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
      const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })

      // Hand the result back to the UI instead of auto-sharing/downloading —
      // the export screen shows a preview with explicit Share/Download actions.
      setState((prev) => ({ ...prev, status: 'success', resultBlob: blob, resultFileName: fileName }))
      markExported()
      void logHistoryEntry(fileName)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed'
      setState((prev) => ({ ...prev, status: 'error', errorMessage: message }))
      toast.error(message)
    }
  }, [])

  const downloadResult = useCallback(
    (fileName?: string) => {
      if (!state.resultBlob) return
      downloadBlob(state.resultBlob, fileName ?? state.resultFileName ?? 'document.pdf')
    },
    [state.resultBlob, state.resultFileName],
  )

  const shareResult = useCallback(
    async (fileName?: string) => {
      if (!state.resultBlob) return
      const shared = await shareBlob(state.resultBlob, fileName ?? state.resultFileName ?? 'document.pdf')
      if (!shared) toast.error("Couldn't share — try downloading instead.")
    },
    [state.resultBlob, state.resultFileName],
  )

  const reset = useCallback(() => setState(IDLE_STATE), [])

  return { ...state, exportPdf, downloadResult, shareResult, reset }
}
