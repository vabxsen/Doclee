import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { getFirebaseFirestore } from '@/firebase/firestore'
import type { ProjectHistoryEntry } from '@/types/projectHistory'

const HISTORY_LIMIT = 50

function historyCollection(uid: string) {
  return collection(getFirebaseFirestore(), 'users', uid, 'history')
}

export interface NewProjectHistoryEntry {
  fileName: string
  pageCount: number
  thumbnailDataUrl: string
}

export async function addProjectHistoryEntry(uid: string, entry: NewProjectHistoryEntry): Promise<void> {
  await addDoc(historyCollection(uid), { ...entry, createdAt: serverTimestamp() })
}

/** Subscribes to the signed-in user's history, most recent first. Returns an unsubscribe function. */
export function subscribeToProjectHistory(
  uid: string,
  callback: (entries: ProjectHistoryEntry[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const historyQuery = query(historyCollection(uid), orderBy('createdAt', 'desc'), limit(HISTORY_LIMIT))
  return onSnapshot(
    historyQuery,
    (snapshot) => {
      const entries = snapshot.docs.map((docSnapshot): ProjectHistoryEntry => {
        const data = docSnapshot.data()
        return {
          id: docSnapshot.id,
          fileName: typeof data.fileName === 'string' ? data.fileName : 'Untitled.pdf',
          pageCount: typeof data.pageCount === 'number' ? data.pageCount : 0,
          thumbnailDataUrl: typeof data.thumbnailDataUrl === 'string' ? data.thumbnailDataUrl : '',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        }
      })
      callback(entries)
    },
    onError,
  )
}

export async function deleteProjectHistoryEntry(uid: string, entryId: string): Promise<void> {
  await deleteDoc(doc(getFirebaseFirestore(), 'users', uid, 'history', entryId))
}
