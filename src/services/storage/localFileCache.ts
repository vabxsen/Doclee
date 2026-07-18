import { get, set, del, createStore } from 'idb-keyval'
import type { UseStore } from 'idb-keyval'

let store: UseStore | null = null

function getBlobStore(): UseStore {
  store ??= createStore('doclee-files', 'blobs')
  return store
}

export async function putFileBlob(id: string, file: Blob): Promise<void> {
  await set(id, file, getBlobStore())
}

export async function getFileBlob(id: string): Promise<Blob | undefined> {
  return get<Blob>(id, getBlobStore())
}

export async function deleteFileBlob(id: string): Promise<void> {
  await del(id, getBlobStore())
}
