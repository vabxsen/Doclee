import { useEffect } from 'react'
import { toast } from 'sonner'
import { consumeRedirectResult, subscribeToAuthChanges } from '@/firebase/auth'
import { isFirebaseConfigured } from '@/firebase/config'
import { useAuthStore } from '@/store/useAuthStore'

/** Mounted once at the app root — subscribes to auth state and resolves any pending redirect sign-in. */
export function useAuthListener(): void {
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setUser(null)
      return
    }

    try {
      consumeRedirectResult().catch((error: unknown) => {
        const description = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`Sign-in failed: ${description}`)
      })
      return subscribeToAuthChanges(setUser)
    } catch {
      // Firebase Auth failed to initialize (e.g. mid dependency re-optimization in dev) —
      // fail closed to signed-out rather than crashing the app.
      setUser(null)
      return undefined
    }
  }, [setUser])
}
