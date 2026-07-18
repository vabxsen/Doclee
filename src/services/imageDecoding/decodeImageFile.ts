import { decodeStandardImage } from '@/services/imageDecoding/decodeStandard'
import { decodeSvgImage, type SvgDecodeOptions } from '@/services/imageDecoding/decodeSvg'

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

/** Dispatches to the right decoder by MIME type / extension, since not every
 * required format (HEIC, TIFF, SVG) can be decoded natively by the browser. */
export async function decodeImageFile(file: File, options: DecodeImageOptions = {}): Promise<DecodedImage> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''

  // HEIC/TIFF decoding pulls in sizeable libraries (heic2any, utif+pako) —
  // dynamically imported so they only load for users who actually upload
  // those formats, keeping the main editor bundle lean.
  let bitmap: ImageBitmap
  if (isHeic(file, extension)) {
    const { decodeHeicImage } = await import('@/services/imageDecoding/decodeHeic')
    bitmap = await decodeHeicImage(file)
  } else if (isTiff(file, extension)) {
    const { decodeTiffImage } = await import('@/services/imageDecoding/decodeTiff')
    bitmap = await decodeTiffImage(file)
  } else if (isSvg(file, extension)) {
    bitmap = await decodeSvgImage(file, options.svg)
  } else {
    bitmap = await decodeStandardImage(file)
  }

  return { bitmap, width: bitmap.width, height: bitmap.height }
}
