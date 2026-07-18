import * as UTIF from 'utif'

export async function decodeTiffImage(file: File): Promise<ImageBitmap> {
  const buffer = await file.arrayBuffer()
  const ifds = UTIF.decode(buffer)
  const page = ifds[0]
  if (!page) throw new Error('TIFF file has no readable pages')

  UTIF.decodeImage(buffer, page, ifds)
  const rgba = UTIF.toRGBA8(page)

  const canvas = document.createElement('canvas')
  canvas.width = page.width
  canvas.height = page.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  const imageData = new ImageData(new Uint8ClampedArray(rgba), page.width, page.height)
  ctx.putImageData(imageData, 0, 0)

  return createImageBitmap(canvas)
}
