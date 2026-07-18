import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { getFirebaseApp } from '@/firebase/app'

let storage: FirebaseStorage | null = null

export function getFirebaseStorage(): FirebaseStorage {
  storage ??= getStorage(getFirebaseApp())
  return storage
}
