import { create } from 'zustand'

export type SettingsTab = 'adjust' | 'pdf'

interface UiState {
  activeSettingsTab: SettingsTab
  zoom: number
  isCropping: boolean
  /** Whether the settings panel overlay is open on mobile (a persistent sidebar on desktop instead). */
  isMobileSettingsOpen: boolean
  autosaveStatus: 'idle' | 'saving' | 'saved'
}

interface UiActions {
  setActiveSettingsTab: (tab: SettingsTab) => void
  setZoom: (zoom: number) => void
  setIsCropping: (cropping: boolean) => void
  setMobileSettingsOpen: (open: boolean) => void
  setAutosaveStatus: (status: UiState['autosaveStatus']) => void
}

export const useUiStore = create<UiState & UiActions>((set) => ({
  activeSettingsTab: 'adjust',
  zoom: 1,
  isCropping: false,
  isMobileSettingsOpen: false,
  autosaveStatus: 'idle',

  setActiveSettingsTab: (tab) => set({ activeSettingsTab: tab }),
  setZoom: (zoom) => set({ zoom }),
  setIsCropping: (cropping) => set({ isCropping: cropping }),
  setMobileSettingsOpen: (open) => set({ isMobileSettingsOpen: open }),
  setAutosaveStatus: (status) => set({ autosaveStatus: status }),
}))
