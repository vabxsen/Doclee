/** Caps how large a fallback decode attempt will render — modern phone cameras (50-200MP) can produce
 * images too large to decode at full resolution on memory-constrained mobile browsers. */
const FALLBACK_MAX_DIMENSION = 4096

/** Decodes via an `<img>` element + canvas — a more lenient path than `createImageBitmap` for edge cases like CMYK JPEGs, which some browsers' fast-path decoders reject outright. */
async function decodeViaImageElement(file: File): Promise<ImageBitmap> {
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Failed to decode image'))
      image.src = url
    })

    const scale = Math.min(1, FALLBACK_MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    return await createImageBitmap(canvas)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function decodeStandardImage(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    // Full-resolution decode can fail simply from running out of memory on a
    // very large photo (a modern phone's 50-200MP camera easily produces a
    // multi-hundred-MB raw bitmap) — retrying resized asks the browser's
    // native decoder to downsample during decode instead of after, which
    // succeeds where the unbounded attempt can't.
    try {
      return await createImageBitmap(file, {
        imageOrientation: 'from-image',
        resizeWidth: FALLBACK_MAX_DIMENSION,
        resizeQuality: 'high',
      })
    } catch {
      return decodeViaImageElement(file)
    }
  }
}
