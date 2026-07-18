import type { PDFDocument } from 'pdf-lib'
import type { PdfMetadata } from '@/types/pdf'
import { APP_NAME } from '@/lib/constants'

export function applyMetadata(pdfDoc: PDFDocument, metadata: PdfMetadata): void {
  if (metadata.title) pdfDoc.setTitle(metadata.title)
  if (metadata.author) pdfDoc.setAuthor(metadata.author)
  if (metadata.subject) pdfDoc.setSubject(metadata.subject)
  if (metadata.keywords) {
    pdfDoc.setKeywords(
      metadata.keywords
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    )
  }
  pdfDoc.setProducer(APP_NAME)
  pdfDoc.setCreator(APP_NAME)
}
