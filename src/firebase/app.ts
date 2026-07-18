import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { firebaseConfig } from '@/firebase/config'

export function getFirebaseApp(): FirebaseApp {
  const existing = getApps()
  return existing.length > 0 ? existing[0]! : initializeApp(firebaseConfig)
}
