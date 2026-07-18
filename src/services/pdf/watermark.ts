import { degrees, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type { WatermarkSettings } from '@/types/pdf'

export function drawWatermarkOnPage(page: PDFPage, watermark: WatermarkSettings, font: PDFFont): void {
  if (!watermark.enabled || !watermark.text.trim()) return

  const textWidth = font.widthOfTextAtSize(watermark.text, watermark.fontSizePt)
  const width = page.getWidth()
  const height = page.getHeight()

  page.drawText(watermark.text, {
    x: width / 2 - textWidth / 2,
    y: height / 2,
    size: watermark.fontSizePt,
    font,
    color: rgb(0.5, 0.5, 0.5),
    opacity: watermark.opacity,
    rotate: degrees(watermark.rotationDeg),
  })
}
