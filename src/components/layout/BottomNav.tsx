import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { History, Home, LayoutGrid, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { snapTransition } from '@/lib/motion'

interface BottomNavProps {
  toolsOpen: boolean
  onToggleTools: () => void
  onCloseTools: () => void
}

interface NavTab {
  label: string
  icon: typeof Home
}

function tabClassName(active: boolean): string {
  return cn(
    'focus-ring relative flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors',
    active ? 'text-ink' : 'text-ink-muted',
  )
}

/** Icon + label + shared active indicator — rendered inside either a NavLink or a plain button, never both nested. */
function TabContent({ icon: Icon, label, active }: NavTab & { active: boolean }) {
  return (
    <>
      {active && (
        <motion.span
          layoutId="bottom-nav-active"
          transition={snapTransition}
          className="absolute top-0.5 h-1 w-8 rounded-full bg-white"
        />
      )}
      <Icon className="size-5" />
      {label}
    </>
  )
}

export function BottomNav({ toolsOpen, onToggleTools, onCloseTools }: BottomNavProps) {
  const location = useLocation()
  const isToolsRoute =
    location.pathname.startsWith('/tools/') && location.pathname !== '/tools/image-to-pdf'
  const toolsActive = toolsOpen || isToolsRoute

  return (
    <nav
      className="glass fixed inset-x-0 bottom-0 z-40 flex border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      <NavLink
        to="/"
        end
        onClick={onCloseTools}
        className={({ isActive }) => tabClassName(isActive && !toolsOpen)}
      >
        {({ isActive }) => <TabContent icon={Home} label="Home" active={isActive && !toolsOpen} />}
      </NavLink>
      <NavLink
        to="/history"
        onClick={onCloseTools}
        className={({ isActive }) => tabClassName(isActive && !toolsOpen)}
      >
        {({ isActive }) => <TabContent icon={History} label="History" active={isActive && !toolsOpen} />}
      </NavLink>
      <button
        type="button"
        className={tabClassName(toolsActive)}
        onClick={onToggleTools}
        aria-expanded={toolsOpen}
      >
        <TabContent icon={LayoutGrid} label="Tools" active={toolsActive} />
      </button>
      <NavLink
        to="/settings"
        onClick={onCloseTools}
        className={({ isActive }) => tabClassName(isActive && !toolsOpen)}
      >
        {({ isActive }) => <TabContent icon={SettingsIcon} label="Settings" active={isActive && !toolsOpen} />}
      </NavLink>
    </nav>
  )
}
