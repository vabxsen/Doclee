import { create } from 'zustand'
import type { User } from 'firebase/auth'

interface AuthState {
  user: User | null
  /** True until the first onAuthStateChanged callback fires, to avoid a signed-out flash. */
  isLoading: boolean
}

interface AuthActions {
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
}))
