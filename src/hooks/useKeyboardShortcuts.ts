import { useEffect } from 'react'

export interface KeyboardShortcut {
  key: string
  meta?: boolean
  shift?: boolean
  handler: () => void
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  )
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return
      const modifierPressed = event.metaKey || event.ctrlKey

      for (const shortcut of shortcuts) {
        const metaMatches = shortcut.meta ? modifierPressed : !modifierPressed
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey
        if (event.key.toLowerCase() === shortcut.key.toLowerCase() && metaMatches && shiftMatches) {
          event.preventDefault()
          shortcut.handler()
          return
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
