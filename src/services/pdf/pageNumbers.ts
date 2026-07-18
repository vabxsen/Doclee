import { rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type { PageNumberSettings, VerticalAlign } from '@/types/pdf'

const FONT_SIZE_PT = 10

export function drawPageNumber(
  page: PDFPage,
  settings: PageNumberSettings,
  font: PDFFont,
  pageIndex: number,
  totalPages: number,
): void {
  if (!settings.enabled) return

  const label = settings.format
    .replace('{n}', String(pageIndex + 1))
    .replace('{total}', String(totalPages))
  const textWidth = font.widthOfTextAtSize(label, FONT_SIZE_PT)

  const yByPosition: Record<VerticalAlign, number> = {
    top: page.getHeight() - 28,
    center: page.getHeight() / 2,
    bottom: 20,
  }

  page.drawText(label, {
    x: page.getWidth() / 2 - textWidth / 2,
    y: yByPosition[settings.position],
    size: FONT_SIZE_PT,
    font,
    color: rgb(0.4, 0.4, 0.4),
  })
}
