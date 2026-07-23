import heic2any from 'heic2any'

export async function decodeHeicImage(file: File): Promise<ImageBitmap> {
  try {
    const converted = await heic2any({ blob: file, toType: 'image/png' })
    const blob = Array.isArray(converted) ? converted[0]! : converted
    return await createImageBitmap(blob, { imageOrientation: 'from-image' })
  } catch (error) {
    // heic2any can choke on some real-world HEIC variants (burst/depth
    // photos). Safari decodes HEIC natively, so give the browser a shot
    // before giving up.
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      throw error
    }
  }
}
