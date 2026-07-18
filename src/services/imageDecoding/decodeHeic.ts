import heic2any from 'heic2any'

export async function decodeHeicImage(file: File): Promise<ImageBitmap> {
  const converted = await heic2any({ blob: file, toType: 'image/png' })
  const blob = Array.isArray(converted) ? converted[0]! : converted
  return createImageBitmap(blob, { imageOrientation: 'from-image' })
}
