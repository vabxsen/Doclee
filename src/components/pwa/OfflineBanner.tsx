import { AnimatePresence, motion } from 'framer-motion'
import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const online = useOnlineStatus()

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden bg-white/6"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-ink-muted">
            <WifiOff className="size-3.5" />
            You&apos;re offline — Doclee still works, nothing leaves your device.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
