import { isSupported, getAnalytics, type Analytics } from 'firebase/analytics'
import { getFirebaseApp } from '@/firebase/app'
import { isFirebaseConfigured } from '@/firebase/config'

let analyticsPromise: Promise<Analytics | null> | null = null

/** Lazily initializes Analytics only in supported, configured environments. */
export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (!isFirebaseConfigured) return Promise.resolve(null)
  if (!analyticsPromise) {
    analyticsPromise = isSupported().then((supported) =>
      supported ? getAnalytics(getFirebaseApp()) : null,
    )
  }
  return analyticsPromise
}
