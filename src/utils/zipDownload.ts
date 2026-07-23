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

/** Downloads a single file directly (as `outputFileName`), or bundles multiple as a zip. */
export async function downloadFileOrZip(entries: ZipEntry[], outputFileName: string): Promise<void> {
  if (entries.length === 1) {
    downloadBlob(entries[0]!.blob, outputFileName)
    return
  }
  await downloadAsZip(entries, outputFileName)
}
