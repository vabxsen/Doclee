import { decodeStandardImage } from '@/services/imageDecoding/decodeStandard'
import { decodeSvgImage, type SvgDecodeOptions } from '@/services/imageDecoding/decodeSvg'
import { sniffImageFormat } from '@/services/imageDecoding/sniffImageFormat'

export interface DecodedImage {
  bitmap: ImageBitmap
  width: number
  height: number
}

export interface DecodeImageOptions {
  /** Only used for SVG rasterization, which has no intrinsic pixel size. */
  svg?: SvgDecodeOptions
}

function isHeic(file: File, extension: string): boolean {
  const mime = file.type.toLowerCase()
  return mime.includes('heic') || mime.includes('heif') || extension === 'heic' || extension === 'heif'
}

function isTiff(file: File, extension: string): boolean {
  const mime = file.type.toLowerCase()
  return mime.includes('tiff') || extension === 'tif' || extension === 'tiff'
}

function isSvg(file: File, extension: string): boolean {
  const mime = file.type.toLowerCase()
  return mime.includes('svg') || extension === 'svg'
}

/**
 * Dispatches to the right decoder by sniffing the file's actual magic bytes
 * first, falling back to its extension/MIME type only when the content is
 * unrecognized (e.g. a format we don't specifically detect, like a plain
 * bitmap that still decodes fine via the standard path). Sniffing matters
 * because extensions lie constantly in the wild — HEIC photos routinely
 * arrive renamed ".jpg" from messaging apps and cloud downloads, which would
 * otherwise get routed to a decoder that can't read them and reported as
 * "unsupported or corrupted" even though the file is perfectly fine.
 */
export async function decodeImageFile(file: File, options: DecodeImageOptions = {}): Promise<DecodedImage> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  const sniffed = await sniffImageFormat(file)

  // HEIC/TIFF decoding pulls in sizeable libraries (heic2any, utif+pako) —
  // dynamically imported so they only load for users who actually upload
  // those formats, keeping the main editor bundle lean.
  let bitmap: ImageBitmap
  if (sniffed === 'heic' || (sniffed === 'unknown' && isHeic(file, extension))) {
    const { decodeHeicImage } = await import('@/services/imageDecoding/decodeHeic')
    bitmap = await decodeHeicImage(file)
  } else if (sniffed === 'tiff' || (sniffed === 'unknown' && isTiff(file, extension))) {
    const { decodeTiffImage } = await import('@/services/imageDecoding/decodeTiff')
    bitmap = await decodeTiffImage(file)
  } else if (sniffed === 'svg' || (sniffed === 'unknown' && isSvg(file, extension))) {
    bitmap = await decodeSvgImage(file, options.svg)
  } else {
    bitmap = await decodeStandardImage(file)
  }

  return { bitmap, width: bitmap.width, height: bitmap.height }
}
