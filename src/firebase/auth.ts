import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth'
import { getFirebaseApp } from '@/firebase/app'
import { useAuthStore } from '@/store/useAuthStore'

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

/** Updates the signed-in user's display name. Email comes from Google and can't be changed here. */
export async function updateDisplayName(name: string): Promise<void> {
  const user = getFirebaseAuth().currentUser
  if (!user) throw new Error('Not signed in')
  await updateProfile(user, { displayName: name })
  // updateProfile mutates `user` in place rather than firing
  // onAuthStateChanged, so passing the same reference back to the store
  // wouldn't trigger a re-render (zustand's selector hooks bail out on an
  // unchanged reference). A shallow copy is enough — nothing reads Firebase
  // User methods off the store, only the plain profile fields.
  useAuthStore.getState().setUser({ ...user } as User)
}
