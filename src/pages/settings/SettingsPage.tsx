import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  CircleCheck,
  Download,
  FileImage,
  LogOut,
  Menu,
  Pencil,
  Share,
  ShieldCheck,
  SquarePlus,
  Trash2,
} from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { BottomNavSpacer } from '@/components/layout/BottomNavSpacer'
import { GoogleIcon } from '@/components/shared/GoogleIcon'
import { GithubIcon } from '@/components/shared/GithubIcon'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Dialog } from '@/components/ui/Dialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useIsStandalone } from '@/hooks/useIsStandalone'
import { signInWithGoogle, signOutUser, updateDisplayName } from '@/firebase/auth'
import { isFirebaseConfigured } from '@/firebase/config'
import { APP_NAME, SUPPORTED_IMAGE_EXTENSIONS } from '@/lib/constants'
import { pluralize } from '@/lib/format'

function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">{title}</p>
      <GlassCard className="flex flex-col gap-4 p-5">{children}</GlassCard>
    </section>
  )
}

function initialsFromName(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function AccountSection() {
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const [signingIn, setSigningIn] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

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
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Couldn't sign out: ${description}`)
    } finally {
      setSigningOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-[12px]" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="size-10 shrink-0 rounded-[12px] object-cover" />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-white/8 text-sm font-semibold text-ink">
            {initialsFromName(user.displayName)}
          </span>
        )}
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-medium text-ink">{user.displayName ?? 'Signed in'}</p>
          <p className="truncate text-xs text-ink-muted">{user.email}</p>
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
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-white/8">
        <GoogleIcon className="size-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">Not signed in</p>
        <p className="text-xs text-ink-muted">
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
        Sign in
      </Button>
    </div>
  )
}

function PersonalInfoSection() {
  const user = useAuthStore((state) => state.user)
  const [name, setName] = useState(user?.displayName ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Keep the field in sync if the signed-in user changes (or their name
  // updates elsewhere) — but not while the user is mid-edit.
  useEffect(() => {
    if (!isEditing) setName(user?.displayName ?? '')
  }, [user?.displayName, isEditing])

  if (!user) return null

  const trimmed = name.trim()
  const canSave = trimmed.length > 0 && trimmed !== (user.displayName ?? '')

  const handleSave = async () => {
    if (!canSave) {
      setIsEditing(false)
      return
    }
    setSaving(true)
    try {
      await updateDisplayName(trimmed)
      toast.success('Name updated')
      setIsEditing(false)
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Couldn't update name: ${description}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setName(user.displayName ?? '')
    setIsEditing(false)
  }

  return (
    <SectionCard title="Personal info">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-ink-muted" htmlFor="personal-info-name">
            Name
          </label>
          {!isEditing && (
            <IconButton
              icon={<Pencil className="size-3.5" />}
              label="Edit name"
              className="size-7"
              onClick={() => setIsEditing(true)}
            />
          )}
        </div>
        <input
          id="personal-info-name"
          value={name}
          disabled={!isEditing}
          onChange={(event) => setName(event.target.value)}
          className={cn(
            'focus-ring glass h-10 w-full rounded-[14px] px-3 text-sm text-ink',
            !isEditing && 'cursor-not-allowed text-ink-muted',
          )}
        />
        {isEditing && (
          <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="secondary" disabled={saving} onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} disabled={!canSave} onClick={() => void handleSave()}>
              Save
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-ink-muted" htmlFor="personal-info-email">
          Email
        </label>
        <input
          id="personal-info-email"
          value={user.email ?? ''}
          disabled
          className="glass h-10 w-full cursor-not-allowed rounded-[14px] px-3 text-sm text-ink-muted"
        />
        <p className="text-xs text-ink-muted">Managed by your Google account.</p>
      </div>
    </SectionCard>
  )
}

export function SettingsPage() {
  const images = useDocumentStore((state) => state.images)
  const resetDocument = useDocumentStore((state) => state.resetDocument)
  const { available: installAvailable, promptInstall } = useInstallPrompt()
  const isStandalone = useIsStandalone()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [installHelpOpen, setInstallHelpOpen] = useState(false)

  const handleClearData = async () => {
    setClearing(true)
    try {
      await resetDocument()
      toast.success('Local data cleared')
    } finally {
      setClearing(false)
      setConfirmOpen(false)
    }
  }

  const handleInstallClick = async () => {
    if (installAvailable) {
      await promptInstall()
      return
    }
    setInstallHelpOpen(true)
  }

  return (
    <>
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
        <SEO title="Settings" description="Manage your Doclee installation and local data." />

        <h1 className="text-2xl font-semibold tracking-tight text-ink">Settings</h1>

        <SectionCard title="Account">
          <AccountSection />
        </SectionCard>

        <PersonalInfoSection />

        <SectionCard title="Install">
          {isStandalone ? (
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-success/15 text-success">
                <CircleCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">Installed</p>
                <p className="text-xs text-ink-muted">You're running Doclee as an installed app.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-white/8 text-ink">
                <Download className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">Install Doclee</p>
                <p className="text-xs text-ink-muted">Add it to your home screen or dock.</p>
              </div>
              <Button size="sm" onClick={() => void handleInstallClick()}>
                Install App
              </Button>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Your document">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-white/8 text-ink">
                <FileImage className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{pluralize(images.length, 'page')} saved</p>
                <p className="text-xs text-ink-muted">Stored only on this device.</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="danger"
              leadingIcon={<Trash2 className="size-3.5" />}
              disabled={images.length === 0}
              onClick={() => setConfirmOpen(true)}
            >
              Clear
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="About">
          <div className="flex items-start gap-3">
            <img src="/logo.png" alt="" className="size-10 shrink-0 rounded-[12px]" />
            <div>
              <p className="text-sm font-medium text-ink">{APP_NAME}</p>
              <p className="mt-1 text-xs text-ink-muted">
                Converts {SUPPORTED_IMAGE_EXTENSIONS.slice(0, 5).join(', ').toUpperCase()} and more into
                lossless PDFs.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 border-t border-border-glass pt-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-white/8 text-ink">
              <ShieldCheck className="size-5" />
            </span>
            <p className="text-xs text-ink-muted">
              No account required. Every conversion runs entirely on your device — signing in only
              adds a synced History of file names and small previews, never your original images
              or PDFs.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Credits">
          <p className="text-sm text-ink">Made with ❤️ by Vaibhav Sen</p>
          <a
            href="https://github.com/vabxsen/Doclee"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring -ml-1 flex w-fit items-center gap-1.5 rounded-[8px] px-1 py-0.5 text-xs text-ink-muted transition-colors hover:text-ink"
          >
            <GithubIcon className="size-3.5" />
            github.com/vabxsen/Doclee
          </a>
        </SectionCard>
      </div>
      <BottomNavSpacer />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Clear local data?"
        description="This removes every saved page and setting from this device. It can't be undone."
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" loading={clearing} onClick={() => void handleClearData()}>
            Clear data
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={installHelpOpen}
        onClose={() => setInstallHelpOpen(false)}
        title="Install Doclee"
        description="Your browser hasn't offered the one-tap install yet, but you can add it manually:"
        size="sm"
      >
        <div className="flex flex-col gap-3">
          {isIOSDevice() ? (
            <>
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-white/8 text-ink">
                  <Share className="size-4" />
                </span>
                <p className="text-sm text-ink-muted">Tap the Share icon in Safari's toolbar</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-white/8 text-ink">
                  <SquarePlus className="size-4" />
                </span>
                <p className="text-sm text-ink-muted">Scroll down and tap "Add to Home Screen"</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-white/8 text-ink">
                  <Menu className="size-4" />
                </span>
                <p className="text-sm text-ink-muted">Open your browser's ⋮ menu</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-white/8 text-ink">
                  <SquarePlus className="size-4" />
                </span>
                <p className="text-sm text-ink-muted">
                  Tap "Add to Home screen" or "Install app" — on desktop, look for the install icon
                  in the address bar instead
                </p>
              </div>
            </>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={() => setInstallHelpOpen(false)}>
            Got it
          </Button>
        </div>
      </Dialog>
    </>
  )
}
