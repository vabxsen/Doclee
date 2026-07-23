export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function canShareFiles(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

/** Returns false if the user cancelled or the browser rejected the share (e.g. no file-share support) — never throws. */
export async function shareBlob(blob: Blob, fileName: string): Promise<boolean> {
  const file = new File([blob], fileName, { type: 'application/pdf' })
  if (!navigator.canShare?.({ files: [file] })) return false
  try {
    await navigator.share({ files: [file], title: fileName })
    return true
  } catch {
    return false
  }
}
