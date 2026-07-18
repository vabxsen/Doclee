import { useEffect, useState } from 'react'

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as NavigatorWithStandalone
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

/** True when the app is running installed (not in a regular browser tab). */
export function useIsStandalone(): boolean {
  const [standalone, setStandalone] = useState(detectStandalone)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handler = () => setStandalone(detectStandalone())
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return standalone
}
