import type { ImageAsset, ImageEdits } from '@/types/image'
import type { PdfSettings } from '@/types/pdf'
import type { HistoryCommand } from '@/types/history'

export interface DocumentState {
  images: ImageAsset[]
  activeImageId: string | null
  pdfSettings: PdfSettings
  undoStack: HistoryCommand[]
  redoStack: HistoryCommand[]
  hasHydrated: boolean
}

export interface DocumentActions {
  setHasHydrated: (value: boolean) => void
  addImages: (assets: ImageAsset[]) => void
  removeImage: (id: string) => void
  duplicateImage: (id: string) => void
  reorderImages: (orderedIds: string[]) => void
  setActiveImage: (id: string | null) => void

  beginImageEditsTransaction: (imageId: string) => void
  updateImageEdits: (imageId: string, updater: (edits: ImageEdits) => ImageEdits) => void
  commitImageEditsTransaction: (imageId: string) => void

  beginPdfSettingsTransaction: () => void
  updatePdfSettings: (updater: (settings: PdfSettings) => PdfSettings) => void
  commitPdfSettingsTransaction: () => void

  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  /** Clears the current document, deleting its cached image blobs first — used any time the user starts a fresh PDF. */
  resetDocument: () => Promise<void>
}

export type DocumentStore = DocumentState & DocumentActions
