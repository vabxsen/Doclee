import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileImage, Home, LayoutGrid, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { snapTransition } from '@/lib/motion'

interface BottomNavProps {
  toolsOpen: boolean
  onToggleTools: () => void
}

interface NavTab {
  label: string
  icon: typeof Home
}

function TabButton({
  icon: Icon,
  label,
  active,
  ...props
}: NavTab & { active: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'focus-ring relative flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors',
        active ? 'text-ink' : 'text-ink-muted',
      )}
      {...props}
    >
      {active && (
        <motion.span
          layoutId="bottom-nav-active"
          transition={snapTransition}
          className="absolute top-0.5 h-1 w-8 rounded-full bg-white"
        />
      )}
      <Icon className="size-5" />
      {label}
    </button>
  )
}

export function BottomNav({ toolsOpen, onToggleTools }: BottomNavProps) {
  const location = useLocation()
  const isToolsRoute =
    location.pathname.startsWith('/tools/') && location.pathname !== '/tools/image-to-pdf'

  return (
    <nav
      className="glass fixed inset-x-0 bottom-0 z-40 flex border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      <NavLink to="/" end className="flex flex-1">
        {({ isActive }) => <TabButton icon={Home} label="Home" active={isActive && !toolsOpen} />}
      </NavLink>
      <NavLink to="/tools/image-to-pdf" className="flex flex-1">
        {({ isActive }) => <TabButton icon={FileImage} label="Convert" active={isActive && !toolsOpen} />}
      </NavLink>
      <TabButton
        icon={LayoutGrid}
        label="Tools"
        active={toolsOpen || isToolsRoute}
        onClick={onToggleTools}
        aria-expanded={toolsOpen}
      />
      <NavLink to="/settings" className="flex flex-1">
        {({ isActive }) => <TabButton icon={SettingsIcon} label="Settings" active={isActive && !toolsOpen} />}
      </NavLink>
    </nav>
  )
}
