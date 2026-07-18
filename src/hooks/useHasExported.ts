import { useEffect, useState } from 'react'

const STORAGE_KEY = 'doclee.hasExported'
const EVENT_NAME = 'doclee:exported'

export function markExported(): void {
  localStorage.setItem(STORAGE_KEY, '1')
  window.dispatchEvent(new Event(EVENT_NAME))
}

export function useHasExported(): boolean {
  const [hasExported, setHasExported] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1',
  )

  useEffect(() => {
    const handler = () => setHasExported(true)
    window.addEventListener(EVENT_NAME, handler)
    return () => window.removeEventListener(EVENT_NAME, handler)
  }, [])

  return hasExported
}
