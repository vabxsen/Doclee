import { PDFDocument } from 'pdf-lib'
import { pdfjsLib, type PDFDocumentProxy } from '@/lib/pdfjs'

export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}

export async function loadPdfLibDocument(file: File): Promise<PDFDocument> {
  const bytes = await readFileAsArrayBuffer(file)
  return PDFDocument.load(bytes)
}

export async function loadPdfjsDocument(file: File): Promise<PDFDocumentProxy> {
  const bytes = await readFileAsArrayBuffer(file)
  return pdfjsLib.getDocument({ data: bytes }).promise
}

/** Renders one page (1-indexed, matching pdf.js convention) to a canvas at the given CSS-pixel scale. */
export async function renderPdfPageToCanvas(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(viewport.width)
  canvas.height = Math.ceil(viewport.height)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D context unavailable')
  // `intent: 'print'` avoids pdf.js's requestAnimationFrame-based render scheduling
  // (used for the 'display' intent), which never fires in backgrounded/headless tabs
  // and would otherwise hang rendering indefinitely.
  await page.render({ canvas, canvasContext: context, viewport, intent: 'print' }).promise
  return canvas
}

export async function renderPdfPageToDataUrl(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
): Promise<string> {
  const canvas = await renderPdfPageToCanvas(doc, pageNumber, scale)
  return canvas.toDataURL('image/png')
}

export function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      mimeType,
      quality,
    )
  })
}

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

/** Strips the .pdf extension (if any) from a file name. */
export function baseFileName(fileName: string): string {
  return fileName.replace(/\.pdf$/i, '')
}
