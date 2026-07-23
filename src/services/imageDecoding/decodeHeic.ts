import heic2any from 'heic2any'

/** Modern phones shoot HEIC at very high resolution — cap the fallback so a huge photo doesn't just OOM instead of decoding. */
const FALLBACK_MAX_DIMENSION = 4096

export async function decodeHeicImage(file: File): Promise<ImageBitmap> {
  try {
    const converted = await heic2any({ blob: file, toType: 'image/png' })
    const blob = Array.isArray(converted) ? converted[0]! : converted
    try {
      return await createImageBitmap(blob, { imageOrientation: 'from-image' })
    } catch {
      // The converted PNG can itself be too large to decode at full
      // resolution on memory-constrained mobile browsers — retry resized.
      return await createImageBitmap(blob, {
        imageOrientation: 'from-image',
        resizeWidth: FALLBACK_MAX_DIMENSION,
        resizeQuality: 'high',
      })
    }
  } catch (error) {
    // heic2any can choke on some real-world HEIC variants (burst/depth
    // photos). Safari decodes HEIC natively, so give the browser a shot
    // before giving up.
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      try {
        return await createImageBitmap(file, {
          imageOrientation: 'from-image',
          resizeWidth: FALLBACK_MAX_DIMENSION,
          resizeQuality: 'high',
        })
      } catch {
        throw error
      }
    }
  }
}
