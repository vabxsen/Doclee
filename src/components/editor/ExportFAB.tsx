import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import type { usePdfExport } from '@/hooks/usePdfExport'
import { ExportProgressDialog } from '@/components/editor/ExportProgressDialog'
import { snapTransition } from '@/lib/motion'

interface ExportFABProps {
  exportState: ReturnType<typeof usePdfExport>
  disabled?: boolean
}

export function ExportFAB({ exportState, disabled }: ExportFABProps) {
  const dialogOpen = exportState.status === 'building' || exportState.status === 'success' || exportState.status === 'error'

  return (
    <>
      {createPortal(
        <motion.button
          type="button"
          disabled={disabled || exportState.status === 'building'}
          onClick={() => exportState.exportPdf()}
          whileHover={disabled ? undefined : { scale: 1.04 }}
          whileTap={disabled ? undefined : { scale: 0.96 }}
          transition={snapTransition}
          className="glass-strong focus-ring fixed bottom-20 right-6 z-30 flex items-center gap-2 rounded-dialog px-5 py-3.5 text-sm font-semibold text-ink shadow-[0_16px_40px_rgba(0,0,0,0.5)] disabled:cursor-not-allowed disabled:opacity-40 md:bottom-8 md:right-8"
        >
          <Download className="size-4" />
          Export PDF
        </motion.button>,
        document.body,
      )}
      <ExportProgressDialog open={dialogOpen} onClose={exportState.reset} {...exportState} />
    </>
  )
}
