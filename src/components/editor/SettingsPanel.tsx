import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Tabs } from '@/components/ui/Tabs'
import { IconButton } from '@/components/ui/IconButton'
import { useUiStore } from '@/store/useUiStore'
import { glideTransition } from '@/lib/motion'
import { AdjustPanel } from '@/components/editor/AdjustPanel'
import { PdfSettingsPanel } from '@/components/editor/PdfSettingsPanel'

function SettingsTabs() {
  const activeTab = useUiStore((state) => state.activeSettingsTab)
  const setActiveTab = useUiStore((state) => state.setActiveSettingsTab)

  return (
    <>
      <div className="flex justify-center border-b border-border-glass p-3">
        <Tabs
          items={[
            { value: 'adjust', label: 'Adjust' },
            { value: 'pdf', label: 'PDF Settings' },
          ]}
          value={activeTab}
          onChange={(value) => setActiveTab(value as 'adjust' | 'pdf')}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'adjust' ? <AdjustPanel /> : <PdfSettingsPanel />}
      </div>
    </>
  )
}

export function SettingsPanel() {
  const isMobileOpen = useUiStore((state) => state.isMobileSettingsOpen)
  const setMobileOpen = useUiStore((state) => state.setMobileSettingsOpen)

  return (
    <>
      {/* Desktop: persistent sidebar */}
      <aside className="hidden h-full w-[320px] shrink-0 flex-col border-l border-border-glass md:flex">
        <SettingsTabs />
      </aside>

      {/* Mobile: full-screen sheet toggled from the toolbar */}
      {createPortal(
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex flex-col bg-black md:hidden"
            >
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={glideTransition}
                className="flex h-full flex-col"
              >
                <div className="flex items-center justify-between px-4 pt-4">
                  <span className="text-base font-semibold text-ink">Edit</span>
                  <IconButton icon={<X className="size-4" />} label="Close" onClick={() => setMobileOpen(false)} />
                </div>
                <SettingsTabs />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
