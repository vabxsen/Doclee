import { PDFDocument, StandardFonts } from 'pdf-lib'
import type { ImageAsset } from '@/types/image'
import { OUTPUT_QUALITY_DPI, type PdfSettings } from '@/types/pdf'
import { getContentAreaPt, getPageSizePt } from '@/services/pdf/pageGeometry'
import { embedImageOntoPage } from '@/services/pdf/embedImage'
import { drawWatermarkOnPage } from '@/services/pdf/watermark'
import { drawPageNumber } from '@/services/pdf/pageNumbers'
import { applyMetadata } from '@/services/pdf/metadata'
import { decodeImageFile } from '@/services/imageDecoding/decodeImageFile'
import { getFileBlob } from '@/services/storage/localFileCache'

export interface BuildPdfProgress {
  completed: number
  total: number
}

export function resolveOutputDpi(settings: PdfSettings): number {
  return settings.outputQuality === 'custom' ? settings.customDpi : OUTPUT_QUALITY_DPI[settings.outputQuality]
}

/**
 * Builds the final PDF: one page per image, in store order, honoring every
 * PDF setting. Yields to the event loop between pages so large documents
 * don't freeze the UI.
 */
export async function buildPdfDocument(
  images: ImageAsset[],
  settings: PdfSettings,
  onProgress?: (progress: BuildPdfProgress) => void,
): Promise<Uint8Array> {
  if (images.length === 0) throw new Error('Add at least one image before exporting.')

  const pdfDoc = await PDFDocument.create()
  applyMetadata(pdfDoc, settings.metadata)

  const dpi = resolveOutputDpi(settings)
  const pageSize = getPageSizePt(settings)
  const contentArea = getContentAreaPt(settings)
  const svgTarget = {
    targetWidth: Math.max(1, Math.round((contentArea.width / 72) * dpi)),
    targetHeight: Math.max(1, Math.round((contentArea.height / 72) * dpi)),
  }

  const needsFont = settings.watermark.enabled || settings.pageNumbers.enabled
  const font = needsFont ? await pdfDoc.embedFont(StandardFonts.Helvetica) : null

  const total = images.length
  for (let index = 0; index < total; index++) {
    const asset = images[index]!
    const blob = await getFileBlob(asset.blobRefId)

    if (blob) {
      const file = new File([blob], asset.fileName, { type: asset.mimeType })
      const { bitmap } = await decodeImageFile(file, { svg: svgTarget })

      const page = pdfDoc.addPage([pageSize.width, pageSize.height])
      await embedImageOntoPage(pdfDoc, page, bitmap, asset, settings, dpi)

      if (settings.watermark.enabled && font) {
        drawWatermarkOnPage(page, settings.watermark, font)
      }
    }

    onProgress?.({ completed: index + 1, total })
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  if (settings.pageNumbers.enabled && font) {
    const pages = pdfDoc.getPages()
    pages.forEach((page, index) => drawPageNumber(page, settings.pageNumbers, font, index, pages.length))
  }

  return pdfDoc.save()
}
