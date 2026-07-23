import { Link, NavLink } from 'react-router-dom'
import { LinkButton } from '@/components/ui/LinkButton'
import { ToolsMegaMenu } from '@/components/layout/ToolsMegaMenu'
import { AccountMenu } from '@/components/layout/AccountMenu'
import { useDocumentStore } from '@/store/useDocumentStore'
import { APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/cn'

export function TopNav() {
  const resetDocument = useDocumentStore((state) => state.resetDocument)

  return (
    <header className="glass sticky top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link to="/" className="focus-ring flex items-center gap-2 rounded-[10px]">
          <img src="/logo.png" alt="" className="size-10 rounded-[12px]" />
          <span className="text-base font-semibold tracking-tight text-ink">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink
            to="/tools/image-to-pdf"
            className={({ isActive }) =>
              cn(
                'focus-ring rounded-[10px] px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink',
                isActive && 'text-ink',
              )
            }
          >
            Image to PDF
          </NavLink>
          <ToolsMegaMenu />
        </nav>

        <div className="flex items-center gap-3">
          <LinkButton
            to="/tools/image-to-pdf"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => void resetDocument()}
          >
            New PDF
          </LinkButton>
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
