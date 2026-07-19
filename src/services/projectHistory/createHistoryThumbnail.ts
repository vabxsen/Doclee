import { getFileBlob } from '@/services/storage/localFileCache'
import { decodeImageFile } from '@/services/imageDecoding/decodeImageFile'
import { renderEditedImage } from '@/services/imageProcessing/cropRotateFlip'
import { canvasToBlob } from '@/services/imageProcessing/canvasToBlob'
import type { ImageAsset } from '@/types/image'

const THUMBNAIL_MAX_DIMENSION = 160
const THUMBNAIL_QUALITY = 0.6

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read thumbnail blob'))
    reader.readAsDataURL(blob)
  })
}

/** A small JPEG data URL of the first page — cheap enough to store directly in a Firestore document. */
export async function createHistoryThumbnail(asset: ImageAsset): Promise<string | null> {
  const blob = await getFileBlob(asset.blobRefId)
  if (!blob) return null

  const file = new File([blob], asset.fileName, { type: asset.mimeType })
  const { bitmap } = await decodeImageFile(file)
  const canvas = renderEditedImage(bitmap, asset.edits, { maxDimension: THUMBNAIL_MAX_DIMENSION })
  const thumbnailBlob = await canvasToBlob(canvas, 'image/jpeg', THUMBNAIL_QUALITY)
  return blobToDataUrl(thumbnailBlob)
}
