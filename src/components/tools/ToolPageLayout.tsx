import type { ReactNode } from 'react'
import { BottomNavSpacer } from '@/components/layout/BottomNavSpacer'

export function ToolPageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-14 sm:px-6">{children}</div>
      <BottomNavSpacer />
    </>
  )
}
