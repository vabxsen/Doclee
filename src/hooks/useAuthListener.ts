import { useEffect } from 'react'
import { toast } from 'sonner'
import { isFirebaseConfigured } from '@/firebase/config'
import { useAuthStore } from '@/store/useAuthStore'

/** If auth state hasn't resolved by then, stop showing a loading state forever and treat as signed out. */
const AUTH_RESOLVE_TIMEOUT_MS = 5000

/**
 * Mounted once at the app root — subscribes to auth state and resolves any
 * pending redirect sign-in. `@/firebase/auth` (and the Auth SDK it pulls in)
 * is dynamically imported here rather than statically, so anonymous/landing
 * visitors don't pay for that weight in the eager entry chunk.
 */
export function useAuthListener(): void {
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setUser(null)
      return
    }

    let cancelled = false
    let unsubscribe: (() => void) | undefined

    // Safety net: onAuthStateChanged can in rare cases never fire (blocked
    // storage, a corrupted IndexedDB, an odd network state) — without this,
    // the UI would show a loading skeleton forever instead of degrading to
    // signed-out.
    const timeoutId = window.setTimeout(() => {
      if (!cancelled && useAuthStore.getState().isLoading) setUser(null)
    }, AUTH_RESOLVE_TIMEOUT_MS)

    import('@/firebase/auth')
      .then(({ consumeRedirectResult, subscribeToAuthChanges }) => {
        if (cancelled) return
        consumeRedirectResult().catch((error: unknown) => {
          const description = error instanceof Error ? error.message : 'Unknown error'
          toast.error(`Sign-in failed: ${description}`)
        })
        unsubscribe = subscribeToAuthChanges(setUser)
      })
      .catch(() => {
        // Firebase Auth failed to initialize (e.g. mid dependency re-optimization in dev) —
        // fail closed to signed-out rather than crashing the app.
        if (!cancelled) setUser(null)
      })

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
      unsubscribe?.()
    }
  }, [setUser])
}
