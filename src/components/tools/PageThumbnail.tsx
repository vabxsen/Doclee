import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Spinner } from '@/components/ui/Spinner'
import { renderPdfPageToDataUrl } from '@/services/pdf/pdfFileIO'
import type { PDFDocumentProxy } from '@/lib/pdfjs'

interface PageThumbnailProps {
  doc: PDFDocumentProxy
  pageNumber: number
  rotationDeg?: number
  className?: string
  overlay?: ReactNode
  onClick?: () => void
}

export function PageThumbnail({
  doc,
  pageNumber,
  rotationDeg = 0,
  className,
  overlay,
  onClick,
}: PageThumbnailProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setDataUrl(null)
    renderPdfPageToDataUrl(doc, pageNumber, 0.4).then((url) => {
      if (!cancelled) setDataUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [doc, pageNumber])

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[14px]',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`Page ${pageNumber}`}
          className="max-h-full max-w-full object-contain transition-transform"
          style={{ transform: `rotate(${rotationDeg}deg)` }}
        />
      ) : (
        <Spinner size={20} />
      )}
      {overlay}
      <span className="absolute bottom-1 right-1.5 rounded-[6px] bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-ink">
        {pageNumber}
      </span>
    </div>
  )
}
