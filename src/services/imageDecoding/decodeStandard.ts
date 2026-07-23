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

    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    ctx.drawImage(image, 0, 0)

    return await createImageBitmap(canvas)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function decodeStandardImage(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return decodeViaImageElement(file)
  }
}
