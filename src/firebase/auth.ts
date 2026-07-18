import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth'
import { getFirebaseApp } from '@/firebase/app'

let auth: Auth | null = null

function getFirebaseAuth(): Auth {
  auth ??= getAuth(getFirebaseApp())
  return auth
}

const googleProvider = new GoogleAuthProvider()

/**
 * Redirect (not popup) sign-in — popups are frequently blocked in installed/
 * standalone PWA contexts on mobile, which is the primary use case here.
 */
export function signInWithGoogle(): Promise<never> {
  return signInWithRedirect(getFirebaseAuth(), googleProvider) as Promise<never>
}

export function signOutUser(): Promise<void> {
  return signOut(getFirebaseAuth())
}

/** Call once on app load to pick up the user after a redirect sign-in completes. */
export function consumeRedirectResult(): Promise<User | null> {
  return getRedirectResult(getFirebaseAuth()).then((result) => result?.user ?? null)
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), callback)
}
