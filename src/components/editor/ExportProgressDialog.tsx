import { motion } from 'framer-motion'
import { CheckCircle2, FileWarning, FileText } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { scaleIn } from '@/lib/motion'
import type { ExportState } from '@/hooks/usePdfExport'

interface ExportProgressDialogProps extends ExportState {
  open: boolean
  onClose: () => void
}

export function ExportProgressDialog({
  open,
  onClose,
  status,
  completed,
  total,
  errorMessage,
}: ExportProgressDialogProps) {
  const percent = total > 0 ? (completed / total) * 100 : 0

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        {status === 'building' && (
          <>
            <motion.span
              variants={scaleIn}
              initial="initial"
              animate="animate"
              className="flex size-14 items-center justify-center rounded-full bg-white/8 text-ink"
            >
              <FileText className="size-6" />
            </motion.span>
            <div>
              <p className="text-sm font-semibold text-ink">Building your PDF…</p>
              <p className="mt-1 text-xs text-ink-muted">
                Page {completed} of {total}
              </p>
            </div>
            <ProgressBar value={percent} className="w-full" />
          </>
        )}

        {status === 'success' && (
          <>
            <motion.span
              variants={scaleIn}
              initial="initial"
              animate="animate"
              className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success"
            >
              <CheckCircle2 className="size-7" />
            </motion.span>
            <p className="text-sm font-semibold text-ink">Your PDF is ready</p>
            <Button size="sm" onClick={onClose}>
              Done
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.span
              variants={scaleIn}
              initial="initial"
              animate="animate"
              className="flex size-14 items-center justify-center rounded-full bg-error/15 text-error"
            >
              <FileWarning className="size-7" />
            </motion.span>
            <p className="text-sm font-semibold text-ink">Export failed</p>
            {errorMessage && <p className="text-xs text-ink-muted">{errorMessage}</p>}
            <Button size="sm" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </>
        )}
      </div>
    </Dialog>
  )
}
