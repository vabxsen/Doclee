import JSZip from 'jszip'
import { downloadBlob } from '@/utils/download'

interface ZipEntry {
  name: string
  blob: Blob
}

export async function downloadAsZip(entries: ZipEntry[], zipFileName: string): Promise<void> {
  const zip = new JSZip()
  for (const entry of entries) zip.file(entry.name, entry.blob)
  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, zipFileName)
}

/** Downloads a single file directly, or bundles multiple as a zip. */
export async function downloadFileOrZip(entries: ZipEntry[], zipFileName: string): Promise<void> {
  if (entries.length === 1) {
    downloadBlob(entries[0]!.blob, entries[0]!.name)
    return
  }
  await downloadAsZip(entries, zipFileName)
}
