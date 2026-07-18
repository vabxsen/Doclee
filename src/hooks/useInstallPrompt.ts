import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null

export function useInstallPrompt() {
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      deferredPrompt = event as BeforeInstallPromptEvent
      setAvailable(true)
    }
    const handleInstalled = () => {
      deferredPrompt = null
      setAvailable(false)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const promptInstall = async (): Promise<'accepted' | 'dismissed' | null> => {
    if (!deferredPrompt) return null
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    deferredPrompt = null
    setAvailable(false)
    return choice.outcome
  }

  return { available, promptInstall }
}
