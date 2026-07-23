import { useEffect, useState, memo } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Spinner } from '@/components/ui/Spinner'
import { renderPdfPageToDataUrl } from '@/services/pdf/pdfFileIO'
import type { PDFDocumentProxy } from '@/lib/pdfjs'

interface PageThumbnailProps {
  doc: PDFDocumentProxy
  pageNumber: number
  rotationDeg?: number
  className?: string
  /** Small corner badge — shown whenever provided (e.g. a rotate hint or a selection checkmark). */
  cornerIcon?: LucideIcon
  /** Classes for the corner badge's circle; default suits a plain hint icon. */
  cornerWrapClassName?: string
  /** Classes for the corner icon itself (size/color). */
  cornerIconClassName?: string
  /** Full-cover dark overlay with a centered icon — shown whenever provided (e.g. marked for deletion). */
  centerIcon?: LucideIcon
  centerIconClassName?: string
  /** Receives the page number that was clicked — kept stable so unaffected thumbnails don't re-render on every click. */
  onClick?: (pageNumber: number) => void
}

function PageThumbnailComponent({
  doc,
  pageNumber,
  rotationDeg = 0,
  className,
  cornerIcon: CornerIcon,
  cornerWrapClassName,
  cornerIconClassName,
  centerIcon: CenterIcon,
  centerIconClassName,
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
      onClick={onClick ? () => onClick(pageNumber) : undefined}
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
      {CenterIcon && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
          <CenterIcon className={cn('size-5', centerIconClassName)} />
        </span>
      )}
      {CornerIcon && (
        <span
          className={cn(
            'absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-ink',
            cornerWrapClassName,
          )}
        >
          <CornerIcon className={cn('size-3', cornerIconClassName)} />
        </span>
      )}
      <span className="absolute bottom-1 right-1.5 rounded-[6px] bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-ink">
        {pageNumber}
      </span>
    </div>
  )
}

/** Wrapped in memo — callers must pass a stable onClick and primitive-ish props (icon component refs, not JSX) so unaffected pages skip re-render when only one page's state changes. */
export const PageThumbnail = memo(PageThumbnailComponent)
