import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { BottomNavSpacer } from '@/components/layout/BottomNavSpacer'

export function ToolPageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-14 sm:px-6">
        <Link
          to="/"
          state={{ openTools: true }}
          className="focus-ring -mb-2 flex w-fit items-center gap-1.5 rounded-[10px] px-1 py-1 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        {children}
      </div>
      <BottomNavSpacer />
    </>
  )
}
