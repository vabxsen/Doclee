import { PDFDocument } from 'pdf-lib'
import { canvasToBlob } from '@/services/imageProcessing/canvasToBlob'

/** Pixel density assumed for scanned pages when converting to PDF points (1pt = 1/72in). */
const SCAN_DPI = 200

/** Builds a PDF with one page per scanned canvas, each page sized to that scan's own aspect ratio. */
export async function buildScanPdf(pages: HTMLCanvasElement[]): Promise<Uint8Array> {
  if (pages.length === 0) throw new Error('Add at least one page before exporting.')

  const pdf = await PDFDocument.create()

  for (const canvas of pages) {
    const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', 0.88)
    const jpegBytes = await jpegBlob.arrayBuffer()
    const image = await pdf.embedJpg(jpegBytes)

    const widthPt = (canvas.width / SCAN_DPI) * 72
    const heightPt = (canvas.height / SCAN_DPI) * 72
    const page = pdf.addPage([widthPt, heightPt])
    page.drawImage(image, { x: 0, y: 0, width: widthPt, height: heightPt })
  }

  return pdf.save()
}
