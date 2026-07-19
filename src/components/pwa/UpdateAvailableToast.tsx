import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/Button'

const UPDATE_CHECK_INTERVAL_MS = 60_000

export function UpdateAvailableToast() {
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swScriptUrl, registration) {
      registrationRef.current = registration
    },
  })

  useEffect(() => {
    // A tab/installed PWA left open across a deploy won't otherwise notice a
    // new version until something prompts the browser to re-check sw.js —
    // check periodically and whenever the app regains focus.
    const checkForUpdate = () => {
      void registrationRef.current?.update()
    }

    const interval = setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', checkForUpdate)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', checkForUpdate)
    }
  }, [])

  useEffect(() => {
    if (!needRefresh) return

    const id = toast.custom(
      () => (
        <div className="glass-strong flex items-center gap-3 rounded-dialog p-4">
          <RefreshCw className="size-4 shrink-0 text-ink" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">Update ready</p>
            <p className="text-xs text-ink-muted">A new version of Doclee is ready to go.</p>
          </div>
          <Button size="sm" onClick={() => updateServiceWorker(true)}>
            Reload
          </Button>
        </div>
      ),
      { duration: Infinity },
    )

    return () => {
      toast.dismiss(id)
    }
  }, [needRefresh, updateServiceWorker])

  return null
}
