export interface SvgDecodeOptions {
  /** Rasterization target size in px. SVGs have no intrinsic resolution, so
   * this should be driven by the document's chosen export DPI. */
  targetWidth?: number
  targetHeight?: number
}

export async function decodeSvgImage(file: File, options: SvgDecodeOptions = {}): Promise<ImageBitmap> {
  const text = await file.text()
  const blob = new Blob([text], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  try {
    const image = new Image()
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Failed to rasterize SVG'))
      image.src = url
    })

    const width = options.targetWidth ?? image.naturalWidth ?? 1000
    const height = options.targetHeight ?? image.naturalHeight ?? 1000

    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(width))
    canvas.height = Math.max(1, Math.round(height))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    return await createImageBitmap(canvas)
  } finally {
    URL.revokeObjectURL(url)
  }
}
