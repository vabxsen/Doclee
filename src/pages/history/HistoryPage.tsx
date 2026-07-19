import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { History as HistoryIcon, Trash2 } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { GoogleIcon } from '@/components/shared/GoogleIcon'
import { BottomNavSpacer } from '@/components/layout/BottomNavSpacer'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { LinkButton } from '@/components/ui/LinkButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/useAuthStore'
import { signInWithGoogle } from '@/firebase/auth'
import {
  deleteProjectHistoryEntry,
  subscribeToProjectHistory,
} from '@/services/projectHistory/projectHistoryService'
import type { ProjectHistoryEntry } from '@/types/projectHistory'
import { formatHistoryDate, pluralize } from '@/lib/format'

function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <GlassCard key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="size-14 shrink-0 rounded-[12px]" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </GlassCard>
      ))}
    </div>
  )
}

function SignInPrompt({ onSignIn, signingIn }: { onSignIn: () => void; signingIn: boolean }) {
  return (
    <GlassCard className="flex flex-col items-center gap-4 p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-white/8">
        <GoogleIcon className="size-6" />
      </span>
      <div>
        <p className="text-sm font-medium text-ink">Sign in to see your history</p>
        <p className="mt-1 text-xs text-ink-muted">
          Your past exports sync to your account — the original images and PDFs never leave this
          device, only a small preview and file name are stored.
        </p>
      </div>
      <Button
        size="sm"
        leadingIcon={<GoogleIcon className="size-4" />}
        loading={signingIn}
        onClick={onSignIn}
      >
        Sign in with Google
      </Button>
    </GlassCard>
  )
}

function HistoryEntryRow({ entry, onDelete }: { entry: ProjectHistoryEntry; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <GlassCard className="flex items-center gap-3 p-3">
      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-black/40">
        {entry.thumbnailDataUrl ? (
          <img src={entry.thumbnailDataUrl} alt="" className="size-full object-cover" />
        ) : (
          <HistoryIcon className="size-5 text-ink-muted" />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium text-ink">{entry.fileName}</p>
        <p className="text-xs text-ink-muted">
          {formatHistoryDate(entry.createdAt)} · {pluralize(entry.pageCount, 'page')}
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        loading={deleting}
        onClick={() => void handleDelete()}
        aria-label="Delete from history"
      >
        <Trash2 className="size-4 text-error" />
      </Button>
    </GlassCard>
  )
}

export function HistoryPage() {
  const user = useAuthStore((state) => state.user)
  const authLoading = useAuthStore((state) => state.isLoading)
  const [entries, setEntries] = useState<ProjectHistoryEntry[] | null>(null)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (!user) {
      setEntries(null)
      return
    }
    setHistoryLoading(true)
    const unsubscribe = subscribeToProjectHistory(
      user.uid,
      (list) => {
        setEntries(list)
        setHistoryLoading(false)
      },
      (error) => {
        console.error('Failed to load history', error)
        setHistoryLoading(false)
        toast.error("Couldn't load your history")
      },
    )
    return unsubscribe
  }, [user])

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

  const handleDelete = async (entryId: string) => {
    if (!user) return
    try {
      await deleteProjectHistoryEntry(user.uid, entryId)
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Couldn't remove entry: ${description}`)
    }
  }

  return (
    <>
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
        <SEO title="History" description="Your past PDF exports, synced to your account." />
        <h1 className="text-2xl font-semibold tracking-tight text-ink">History</h1>

        {authLoading ? (
          <HistorySkeleton />
        ) : !user ? (
          <SignInPrompt onSignIn={() => void handleSignIn()} signingIn={signingIn} />
        ) : historyLoading ? (
          <HistorySkeleton />
        ) : !entries || entries.length === 0 ? (
          <EmptyState
            icon={<HistoryIcon className="size-6" />}
            title="No history yet"
            description="Export a PDF and it'll show up here."
            action={<LinkButton to="/tools/image-to-pdf">Start a PDF</LinkButton>}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <HistoryEntryRow key={entry.id} entry={entry} onDelete={() => handleDelete(entry.id)} />
            ))}
          </div>
        )}
      </div>
      <BottomNavSpacer />
    </>
  )
}
