import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useHasExported } from '@/hooks/useHasExported'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { glideTransition } from '@/lib/motion'

const DISMISSED_KEY = 'doclee.installDismissed'

export function InstallPrompt() {
  const { available, promptInstall } = useInstallPrompt()
  const hasExported = useHasExported()
  const [dismissed, setDismissed] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(DISMISSED_KEY) === '1',
  )

  const visible = available && hasExported && !dismissed

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={glideTransition}
          className="glass-strong fixed bottom-5 left-5 z-40 flex max-w-sm items-start gap-3 rounded-dialog p-4"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-white/10">
            <Download className="size-4 text-ink" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">Install Doclee</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              Add it to your dock for offline access and a faster launch.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => promptInstall()}>
                Install
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                Not now
              </Button>
            </div>
          </div>
          <IconButton icon={<X className="size-3.5" />} label="Dismiss" onClick={dismiss} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
