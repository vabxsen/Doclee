import { useUiStore } from '@/store/useUiStore'

/** Exposes the debounced autosave status driven by the document store's persist storage. */
export function useAutosave() {
  return useUiStore((state) => state.autosaveStatus)
}
