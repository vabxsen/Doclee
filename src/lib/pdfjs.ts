import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

export { pdfjsLib }
export type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
