import { COMPRESSION_QUALITY, type CompressionLevel } from '@/types/pdf'
import { canvasToBlob } from '@/services/imageProcessing/canvasToBlob'

export interface EncodedRaster {
  bytes: ArrayBuffer
  format: 'png' | 'jpg'
}

/**
 * Lossless by default (PNG), per the "no unnecessary compression" requirement.
 * Compression is strictly opt-in — only switches to JPEG when the user picks
 * a compression level above 'none'.
 */
export async function encodeCanvasForPdf(
  canvas: HTMLCanvasElement,
  compression: CompressionLevel,
): Promise<EncodedRaster> {
  if (compression === 'none') {
    const blob = await canvasToBlob(canvas, 'image/png')
    return { bytes: await blob.arrayBuffer(), format: 'png' }
  }
  const quality = COMPRESSION_QUALITY[compression]
  const blob = await canvasToBlob(canvas, 'image/jpeg', quality)
  return { bytes: await blob.arrayBuffer(), format: 'jpg' }
}
