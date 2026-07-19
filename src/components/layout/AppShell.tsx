import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'sonner'
import { TopNav } from '@/components/layout/TopNav'
import { BottomNav } from '@/components/layout/BottomNav'
import { MobileNav } from '@/components/layout/MobileNav'
import { PageTransition } from '@/components/layout/PageTransition'
import { Spinner } from '@/components/ui/Spinner'
import { OfflineBanner } from '@/components/pwa/OfflineBanner'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { UpdateAvailableToast } from '@/components/pwa/UpdateAvailableToast'

function RouteFallback() {
  return (
    <div className="flex h-[60svh] items-center justify-center">
      <Spinner size={28} />
    </div>
  )
}

export function AppShell() {
  const location = useLocation()
  const [toolsOpen, setToolsOpen] = useState(false)

  useEffect(() => {
    setToolsOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-svh flex-col bg-base">
      <TopNav />
      <OfflineBanner />
      <div className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </Suspense>
      </div>
      <BottomNav
        toolsOpen={toolsOpen}
        onToggleTools={() => setToolsOpen((open) => !open)}
        onCloseTools={() => setToolsOpen(false)}
      />
      <MobileNav open={toolsOpen} onClose={() => setToolsOpen(false)} />
      <Toaster
        theme="dark"
        position="bottom-right"
        offset={{ bottom: 96 }}
        toastOptions={{
          classNames: {
            toast: 'glass-strong !rounded-dialog !text-ink !border-border-glass-strong',
            title: '!text-ink',
            description: '!text-ink-muted',
          },
        }}
      />
      <InstallPrompt />
      <UpdateAvailableToast />
    </div>
  )
}
