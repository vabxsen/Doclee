import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { LogOut, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { snapTransition } from '@/lib/motion'
import { GoogleIcon } from '@/components/shared/GoogleIcon'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'
import { signInWithGoogle, signOutUser } from '@/firebase/auth'
import { isFirebaseConfigured } from '@/firebase/config'

function initialsFromName(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function AccountMenu() {
  const user = useAuthStore((state) => state.user)
  const [open, setOpen] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [position, setPosition] = useState({ top: 0, right: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      setPosition({ top: rect.bottom + 12, right: window.innerWidth - rect.right })
    }
    updatePosition()

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (containerRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', updatePosition)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  const handleSignIn = async () => {
    setSigningIn(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Couldn't start sign-in: ${description}`)
      setSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOutUser()
      toast.success('Signed out')
      setOpen(false)
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Couldn't sign out: ${description}`)
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Account"
        className="focus-ring flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/8 text-ink transition-colors hover:bg-white/12"
      >
        {user ? (
          user.photoURL ? (
            <img src={user.photoURL} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-xs font-semibold">{initialsFromName(user.displayName)}</span>
          )
        ) : (
          <User className="size-4" />
        )}
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={snapTransition}
              style={{ top: position.top, right: position.right }}
              className="fixed z-50 w-64 rounded-dialog border border-border-glass-strong bg-[#1c1c1e] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
            >
              {user ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        className="size-10 shrink-0 rounded-[12px] object-cover"
                      />
                    ) : (
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-white/8 text-sm font-semibold text-ink">
                        {initialsFromName(user.displayName)}
                      </span>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-ink">
                        {user.displayName ?? 'Signed in'}
                      </p>
                      <p className="truncate text-xs text-ink-muted">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    leadingIcon={<LogOut className="size-3.5" />}
                    loading={signingOut}
                    onClick={() => void handleSignOut()}
                  >
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">Not signed in</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      Optional — your documents stay on this device either way.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    leadingIcon={<GoogleIcon className="size-4" />}
                    loading={signingIn}
                    disabled={!isFirebaseConfigured}
                    onClick={() => void handleSignIn()}
                  >
                    Sign in with Google
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
