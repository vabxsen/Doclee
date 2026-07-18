import { getFirestore, type Firestore } from 'firebase/firestore'
import { getFirebaseApp } from '@/firebase/app'

let db: Firestore | null = null

export function getFirebaseFirestore(): Firestore {
  db ??= getFirestore(getFirebaseApp())
  return db
}
