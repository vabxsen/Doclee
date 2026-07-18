import { rgb, type PDFDocument, type PDFPage } from 'pdf-lib'
import type { ImageAsset } from '@/types/image'
import type { ImageAlignment, PdfSettings } from '@/types/pdf'
import { renderEditedImage } from '@/services/imageProcessing/cropRotateFlip'
import { encodeCanvasForPdf } from '@/services/pdf/compression'
import { computePlacement, getContentAreaPt, type ContentAreaPt } from '@/services/pdf/pageGeometry'

/**
 * Crops an already-edited canvas down to the content area's aspect ratio so
 * a 'fill' (cover) fit never spills onto margins — done at the raster level
 * so we don't need PDF-level clipping.
 */
function coverCropToContentArea(
  source: HTMLCanvasElement,
  contentArea: ContentAreaPt,
  dpi: number,
  alignment: ImageAlignment,
): HTMLCanvasElement {
  const targetWidthPx = Math.max(1, Math.round((contentArea.width / 72) * dpi))
  const targetHeightPx = Math.max(1, Math.round((contentArea.height / 72) * dpi))
  const targetAspect = targetWidthPx / targetHeightPx
  const sourceAspect = source.width / source.height

  let cropWidth = source.width
  let cropHeight = source.height
  if (sourceAspect > targetAspect) {
    cropWidth = Math.round(source.height * targetAspect)
  } else {
    cropHeight = Math.round(source.width / targetAspect)
  }

  const horizontalRatio = { left: 0, center: 0.5, right: 1 }[alignment.horizontal]
  const verticalRatio = { top: 0, center: 0.5, bottom: 1 }[alignment.vertical]
  const cropX = Math.round((source.width - cropWidth) * horizontalRatio)
  const cropY = Math.round((source.height - cropHeight) * verticalRatio)

  const canvas = document.createElement('canvas')
  canvas.width = targetWidthPx
  canvas.height = targetHeightPx
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.drawImage(source, cropX, cropY, cropWidth, cropHeight, 0, 0, targetWidthPx, targetHeightPx)
  return canvas
}

export async function embedImageOntoPage(
  pdfDoc: PDFDocument,
  page: PDFPage,
  bitmap: ImageBitmap,
  asset: ImageAsset,
  settings: PdfSettings,
  dpi: number,
): Promise<void> {
  const contentArea = getContentAreaPt(settings)
  const contentAreaLongEdgeIn = Math.max(contentArea.width, contentArea.height) / 72
  const targetLongEdgePx = Math.max(1, Math.round(contentAreaLongEdgeIn * dpi))

  const editedCanvas = renderEditedImage(bitmap, asset.edits, { exactLongEdge: targetLongEdgePx })

  const finalCanvas =
    settings.imageFit === 'fill'
      ? coverCropToContentArea(editedCanvas, contentArea, dpi, settings.alignment)
      : editedCanvas

  const { bytes, format } = await encodeCanvasForPdf(finalCanvas, settings.compression)
  const embedded = format === 'png' ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes)

  const placement =
    settings.imageFit === 'fill'
      ? { x: contentArea.x, y: contentArea.y, width: contentArea.width, height: contentArea.height }
      : computePlacement(
          (editedCanvas.width / dpi) * 72,
          (editedCanvas.height / dpi) * 72,
          contentArea,
          settings.imageFit,
          settings.alignment,
        )

  if (settings.background !== 'transparent') {
    page.drawRectangle({
      x: 0,
      y: 0,
      width: page.getWidth(),
      height: page.getHeight(),
      color: settings.background === 'white' ? rgb(1, 1, 1) : rgb(0, 0, 0),
    })
  }

  page.drawImage(embedded, placement)
}
