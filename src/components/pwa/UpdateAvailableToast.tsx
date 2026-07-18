import { useEffect } from 'react'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/Button'

export function UpdateAvailableToast() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

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
