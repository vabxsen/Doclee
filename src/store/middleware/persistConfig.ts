import { createJSONStorage, type PersistOptions, type StateStorage } from 'zustand/middleware'
import { AUTOSAVE_DEBOUNCE_MS, DOCUMENT_STORE_STORAGE_KEY } from '@/lib/constants'
import { useUiStore } from '@/store/useUiStore'
import type { DocumentStore } from '@/store/types'

type PersistedSlice = Pick<DocumentStore, 'images' | 'activeImageId' | 'pdfSettings'>

/**
 * Debounces localStorage writes so a rapid slider/crop drag (which updates
 * the store on every pointermove) doesn't serialize the whole document on
 * every frame — only once interaction settles.
 */
function createDebouncedLocalStorage(): StateStorage {
  let timer: ReturnType<typeof setTimeout> | null = null

  return {
    getItem: (name) => localStorage.getItem(name),
    removeItem: (name) => localStorage.removeItem(name),
    setItem: (name, value) => {
      useUiStore.getState().setAutosaveStatus('saving')
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        localStorage.setItem(name, value)
        useUiStore.getState().setAutosaveStatus('saved')
      }, AUTOSAVE_DEBOUNCE_MS)
    },
  }
}

export const documentPersistOptions: PersistOptions<DocumentStore, PersistedSlice> = {
  name: DOCUMENT_STORE_STORAGE_KEY,
  storage: createJSONStorage(createDebouncedLocalStorage),
  partialize: (state) => ({
    images: state.images,
    activeImageId: state.activeImageId,
    pdfSettings: state.pdfSettings,
  }),
  onRehydrateStorage: () => (state) => {
    state?.setHasHydrated(true)
  },
}
