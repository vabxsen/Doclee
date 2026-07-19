import { useEffect, useState } from 'react'
import { loadPdfjsDocument } from '@/services/pdf/pdfFileIO'
import type { PDFDocumentProxy } from '@/lib/pdfjs'

interface LoadedPdf {
  doc: PDFDocumentProxy | null
  pageCount: number
  loading: boolean
  error: string | null
}

export function useLoadedPdf(file: File | null): LoadedPdf {
  const [state, setState] = useState<LoadedPdf>({ doc: null, pageCount: 0, loading: false, error: null })

  useEffect(() => {
    if (!file) {
      setState({ doc: null, pageCount: 0, loading: false, error: null })
      return
    }
    let cancelled = false
    setState({ doc: null, pageCount: 0, loading: true, error: null })
    loadPdfjsDocument(file)
      .then((doc) => {
        if (cancelled) return
        setState({ doc, pageCount: doc.numPages, loading: false, error: null })
      })
      .catch(() => {
        if (cancelled) return
        setState({ doc: null, pageCount: 0, loading: false, error: "Couldn't read that PDF" })
      })
    return () => {
      cancelled = true
    }
  }, [file])

  return state
}
