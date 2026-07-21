import { COMPRESSION_QUALITY, type CompressionLevel } from '@/types/pdf'
import { canvasToBlob } from '@/services/imageProcessing/canvasToBlob'

export interface EncodedRaster {
  bytes: ArrayBuffer
  format: 'png' | 'jpg'
}

/** Near-transparent JPEG quality used when the source was itself lossy — see below. */
const LOSSY_SOURCE_JPEG_QUALITY = 0.95

const LOSSY_SOURCE_MIME_FRAGMENTS = ['jpeg', 'jpg', 'heic', 'heif', 'webp']

function isLossySource(mimeType: string | undefined): boolean {
  if (!mimeType) return false
  const lower = mimeType.toLowerCase()
  return LOSSY_SOURCE_MIME_FRAGMENTS.some((fragment) => lower.includes(fragment))
}

/**
 * Compression above 'none' is strictly opt-in JPEG at the chosen quality.
 *
 * At 'none', the encoding follows the source: PNG for genuinely lossless
 * sources (PNG/BMP/GIF/TIFF/SVG), but high-quality JPEG when the source was
 * already lossy (JPEG/HEIC/WEBP) — PNG-encoding an already-lossy photo can't
 * recover any quality and only balloons the file 10-20x.
 */
export async function encodeCanvasForPdf(
  canvas: HTMLCanvasElement,
  compression: CompressionLevel,
  sourceMimeType?: string,
): Promise<EncodedRaster> {
  if (compression === 'none') {
    if (isLossySource(sourceMimeType)) {
      const blob = await canvasToBlob(canvas, 'image/jpeg', LOSSY_SOURCE_JPEG_QUALITY)
      return { bytes: await blob.arrayBuffer(), format: 'jpg' }
    }
    const blob = await canvasToBlob(canvas, 'image/png')
    return { bytes: await blob.arrayBuffer(), format: 'png' }
  }
  const quality = COMPRESSION_QUALITY[compression]
  const blob = await canvasToBlob(canvas, 'image/jpeg', quality)
  return { bytes: await blob.arrayBuffer(), format: 'jpg' }
}
