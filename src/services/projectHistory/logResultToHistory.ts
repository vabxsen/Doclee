import { useAuthStore } from '@/store/useAuthStore'

const THUMBNAIL_MAX_DIMENSION = 160
const THUMBNAIL_QUALITY = 0.6

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read thumbnail blob'))
    reader.readAsDataURL(blob)
  })
}

export interface ResultToLog {
  /** The produced file. Optional — zip/multi-file results can log metadata only. */
  blob?: Blob
  fileName: string
  /** Overrides the page count when the blob isn't a readable PDF (zips, docx, …). */
  pageCount?: number
}

/**
 * Best-effort history logging for any tool result — page count and first-page
 * thumbnail are derived from the blob when it's a readable PDF. Never throws
 * and never blocks the tool's own flow; silently a no-op when signed out.
 */
export async function logResultToHistory({ blob, fileName, pageCount = 0 }: ResultToLog): Promise<void> {
  const user = useAuthStore.getState().user
  if (!user) return

  let thumbnailDataUrl = ''
  const looksLikePdf = blob && (blob.type === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf'))

  if (blob && looksLikePdf) {
    // Encrypted outputs (Lock PDF) can't be re-opened — log the entry without a thumbnail.
    try {
      const [{ pdfjsLib }, { renderPdfPageToCanvas, canvasToBlob }] = await Promise.all([
        import('@/lib/pdfjs'),
        import('@/services/pdf/pdfFileIO'),
      ])
      const doc = await pdfjsLib.getDocument({ data: await blob.arrayBuffer() }).promise
      pageCount = doc.numPages
      const page = await doc.getPage(1)
      const viewport = page.getViewport({ scale: 1 })
      const scale = THUMBNAIL_MAX_DIMENSION / Math.max(viewport.width, viewport.height)
      const canvas = await renderPdfPageToCanvas(doc, 1, scale)
      thumbnailDataUrl = await blobToDataUrl(await canvasToBlob(canvas, 'image/jpeg', THUMBNAIL_QUALITY))
    } catch {
      // Keep going — the entry is still worth logging without a preview.
    }
  }

  try {
    const { addProjectHistoryEntry } = await import('@/services/projectHistory/projectHistoryService')
    await addProjectHistoryEntry(user.uid, { fileName, pageCount, thumbnailDataUrl })
  } catch (error) {
    console.error('Failed to log history entry', error)
  }
}
