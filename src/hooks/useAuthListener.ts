import { useEffect } from 'react'
import { toast } from 'sonner'
import { isFirebaseConfigured } from '@/firebase/config'
import { useAuthStore } from '@/store/useAuthStore'

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
      unsubscribe?.()
    }
  }, [setUser])
}
