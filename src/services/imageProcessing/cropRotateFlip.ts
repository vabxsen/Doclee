import type { ImageEdits } from '@/types/image'
import { getCssFilterString, hasManualPixelEffects } from '@/services/imageProcessing/filterDefinitions'
import { applyManualPixelEffects } from '@/services/imageProcessing/applyFilters'

export interface RenderOptions {
  /** Caps the longest output edge (never upscales) — used for cheap live previews. */
  maxDimension?: number
  /** Renders at exactly this long-edge size, scaling up or down as needed — used for DPI-accurate export. Takes priority over maxDimension. */
  exactLongEdge?: number
  /** Renders the full rotated/flipped/filtered image ignoring the crop rect — used while the crop tool is active, so its overlay can be positioned against the uncropped bounds. */
  ignoreCrop?: boolean
}

/**
 * Composites crop → rotate → flip → filters onto a fresh canvas at the
 * requested resolution. Non-destructive: the source bitmap is never mutated,
 * so re-rendering at a different resolution (e.g. a higher export DPI) is
 * always possible from the same decoded source.
 */
export function renderEditedImage(
  source: ImageBitmap | HTMLCanvasElement,
  edits: ImageEdits,
  options: RenderOptions = {},
): HTMLCanvasElement {
  const sourceWidth = source.width
  const sourceHeight = source.height

  const crop = options.ignoreCrop ? { x: 0, y: 0, width: 1, height: 1 } : edits.crop
  const cropX = Math.round(crop.x * sourceWidth)
  const cropY = Math.round(crop.y * sourceHeight)
  const cropWidth = Math.max(1, Math.round(crop.width * sourceWidth))
  const cropHeight = Math.max(1, Math.round(crop.height * sourceHeight))

  const rotatedSwapsAxes = edits.rotation === 90 || edits.rotation === 270
  let outputWidth = rotatedSwapsAxes ? cropHeight : cropWidth
  let outputHeight = rotatedSwapsAxes ? cropWidth : cropHeight

  if (options.exactLongEdge) {
    const scale = options.exactLongEdge / Math.max(outputWidth, outputHeight)
    outputWidth = Math.max(1, Math.round(outputWidth * scale))
    outputHeight = Math.max(1, Math.round(outputHeight * scale))
  } else if (options.maxDimension) {
    const scale = Math.min(1, options.maxDimension / Math.max(outputWidth, outputHeight))
    outputWidth = Math.max(1, Math.round(outputWidth * scale))
    outputHeight = Math.max(1, Math.round(outputHeight * scale))
  }

  const canvas = document.createElement('canvas')
  canvas.width = outputWidth
  canvas.height = outputHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  ctx.save()
  ctx.filter = getCssFilterString(edits.filters)

  // Move to center, apply rotation/flip, then draw so the crop region fills the canvas.
  ctx.translate(outputWidth / 2, outputHeight / 2)
  ctx.rotate((edits.rotation * Math.PI) / 180)
  ctx.scale(edits.flipH ? -1 : 1, edits.flipV ? -1 : 1)

  const drawWidth = rotatedSwapsAxes ? outputHeight : outputWidth
  const drawHeight = rotatedSwapsAxes ? outputWidth : outputHeight

  ctx.drawImage(
    source,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight,
  )
  ctx.restore()

  if (hasManualPixelEffects(edits.filters)) {
    const imageData = ctx.getImageData(0, 0, outputWidth, outputHeight)
    const processed = applyManualPixelEffects(imageData, edits.filters)
    ctx.putImageData(processed, 0, 0)
  }

  return canvas
}
