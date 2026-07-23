import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { documentPersistOptions } from '@/store/middleware/persistConfig'
import { DEFAULT_PDF_SETTINGS } from '@/types/pdf'
import type { ImageEdits } from '@/types/image'
import type { PdfSettings } from '@/types/pdf'
import type { HistoryCommand } from '@/types/history'
import { MAX_UNDO_STACK_SIZE } from '@/lib/constants'
import { createId } from '@/utils/id'
import { deleteFileBlob } from '@/services/storage/localFileCache'
import type { DocumentStore } from '@/store/types'

/**
 * Transient "before" snapshots for in-progress drag/slider interactions.
 * Deliberately kept outside the reactive store — they're write-only until
 * commit and don't need to trigger re-renders.
 */
const pendingImageEditSnapshots = new Map<string, ImageEdits>()
let pendingPdfSettingsSnapshot: PdfSettings | null = null

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      images: [],
      activeImageId: null,
      pdfSettings: DEFAULT_PDF_SETTINGS,
      undoStack: [],
      redoStack: [],
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      addImages: (assets) => {
        if (assets.length === 0) return
        const prevImages = get().images
        const nextImages = [...prevImages, ...assets]
        const command: HistoryCommand<typeof prevImages> = {
          type: 'add-images',
          prevValue: prevImages,
          nextValue: nextImages,
          apply: (value) => set({ images: value }),
        }
        set((state) => ({
          images: nextImages,
          activeImageId: state.activeImageId ?? assets[0]!.id,
          undoStack: pushCommand(state.undoStack, command),
          redoStack: [],
        }))
      },

      removeImage: (id) => {
        const prevImages = get().images
        const nextImages = prevImages.filter((image) => image.id !== id)
        const command: HistoryCommand<typeof prevImages> = {
          type: 'remove-image',
          imageId: id,
          prevValue: prevImages,
          nextValue: nextImages,
          apply: (value) => set({ images: value }),
        }
        set((state) => ({
          images: nextImages,
          activeImageId: state.activeImageId === id ? (nextImages[0]?.id ?? null) : state.activeImageId,
          undoStack: pushCommand(state.undoStack, command),
          redoStack: [],
        }))
      },

      duplicateImage: (id) => {
        const prevImages = get().images
        const index = prevImages.findIndex((image) => image.id === id)
        if (index === -1) return
        const source = prevImages[index]!
        const duplicate = { ...source, id: createId('img'), createdAt: Date.now() }
        const nextImages = [...prevImages.slice(0, index + 1), duplicate, ...prevImages.slice(index + 1)]
        const command: HistoryCommand<typeof prevImages> = {
          type: 'duplicate-image',
          imageId: id,
          prevValue: prevImages,
          nextValue: nextImages,
          apply: (value) => set({ images: value }),
        }
        set((state) => ({
          images: nextImages,
          undoStack: pushCommand(state.undoStack, command),
          redoStack: [],
        }))
      },

      reorderImages: (orderedIds) => {
        const prevImages = get().images
        const byId = new Map(prevImages.map((image) => [image.id, image]))
        const nextImages = orderedIds.map((id) => byId.get(id)).filter((image) => image !== undefined)
        if (nextImages.length !== prevImages.length) return
        const command: HistoryCommand<typeof prevImages> = {
          type: 'reorder-images',
          prevValue: prevImages,
          nextValue: nextImages,
          apply: (value) => set({ images: value }),
        }
        set((state) => ({
          images: nextImages,
          undoStack: pushCommand(state.undoStack, command),
          redoStack: [],
        }))
      },

      setActiveImage: (id) => set({ activeImageId: id }),

      beginImageEditsTransaction: (imageId) => {
        const image = get().images.find((item) => item.id === imageId)
        if (image) pendingImageEditSnapshots.set(imageId, image.edits)
      },

      updateImageEdits: (imageId, updater) => {
        set((state) => ({
          images: state.images.map((image) =>
            image.id === imageId ? { ...image, edits: updater(image.edits) } : image,
          ),
        }))
      },

      commitImageEditsTransaction: (imageId) => {
        const prevEdits = pendingImageEditSnapshots.get(imageId)
        pendingImageEditSnapshots.delete(imageId)
        const nextEdits = get().images.find((image) => image.id === imageId)?.edits
        if (!prevEdits || !nextEdits || prevEdits === nextEdits) return

        const command: HistoryCommand<ImageEdits> = {
          type: 'update-image-edits',
          imageId,
          prevValue: prevEdits,
          nextValue: nextEdits,
          apply: (value) =>
            set((state) => ({
              images: state.images.map((image) =>
                image.id === imageId ? { ...image, edits: value } : image,
              ),
            })),
        }
        set((state) => ({
          undoStack: pushCommand(state.undoStack, command),
          redoStack: [],
        }))
      },

      beginPdfSettingsTransaction: () => {
        pendingPdfSettingsSnapshot = get().pdfSettings
      },

      updatePdfSettings: (updater) => {
        set((state) => ({ pdfSettings: updater(state.pdfSettings) }))
      },

      commitPdfSettingsTransaction: () => {
        const prevSettings = pendingPdfSettingsSnapshot
        pendingPdfSettingsSnapshot = null
        const nextSettings = get().pdfSettings
        if (!prevSettings || prevSettings === nextSettings) return

        const command: HistoryCommand<PdfSettings> = {
          type: 'update-pdf-settings',
          prevValue: prevSettings,
          nextValue: nextSettings,
          apply: (value) => set({ pdfSettings: value }),
        }
        set((state) => ({
          undoStack: pushCommand(state.undoStack, command),
          redoStack: [],
        }))
      },

      undo: () => {
        const { undoStack, redoStack } = get()
        const command = undoStack[undoStack.length - 1]
        if (!command) return
        command.apply(command.prevValue)
        set({
          undoStack: undoStack.slice(0, -1),
          redoStack: [...redoStack, command],
        })
      },

      redo: () => {
        const { undoStack, redoStack } = get()
        const command = redoStack[redoStack.length - 1]
        if (!command) return
        command.apply(command.nextValue)
        set({
          redoStack: redoStack.slice(0, -1),
          undoStack: pushCommand(undoStack, command),
        })
      },

      canUndo: () => get().undoStack.length > 0,
      canRedo: () => get().redoStack.length > 0,

      resetDocument: () => {
        // Duplicated images share a blobRefId with their source, so dedupe
        // before deleting — every asset is being discarded together here,
        // unlike a single removeImage, so there's no "still in use elsewhere" risk.
        const blobRefIds = new Set(get().images.map((image) => image.blobRefId))

        pendingImageEditSnapshots.clear()
        pendingPdfSettingsSnapshot = null
        set({
          images: [],
          activeImageId: null,
          pdfSettings: DEFAULT_PDF_SETTINGS,
          undoStack: [],
          redoStack: [],
        })

        // Never gate clearing the UI on this — it's cache cleanup, not user-visible state.
        void Promise.all([...blobRefIds].map((id) => deleteFileBlob(id)))
        return Promise.resolve()
      },
    }),
    documentPersistOptions,
  ),
)

function pushCommand(stack: HistoryCommand[], command: HistoryCommand): HistoryCommand[] {
  const next = [...stack, command]
  return next.length > MAX_UNDO_STACK_SIZE ? next.slice(next.length - MAX_UNDO_STACK_SIZE) : next
}
