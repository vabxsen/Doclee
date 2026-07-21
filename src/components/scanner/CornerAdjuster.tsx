import { useRef } from 'react'
import type { Quad } from '@/services/scanner/perspectiveWarp'

interface CornerAdjusterProps {
  imageUrl: string
  naturalWidth: number
  naturalHeight: number
  quad: Quad
  onChange: (quad: Quad) => void
}

const HANDLE_LABELS = ['Top left', 'Top right', 'Bottom right', 'Bottom left']

/**
 * Overlays a draggable 4-point quad on top of a captured photo so the user
 * can mark the document's edges for perspective correction. The container is
 * locked to the image's own aspect ratio so screen-space drag deltas map
 * directly (via one scale factor) onto natural image pixel coordinates.
 */
export function CornerAdjuster({ imageUrl, naturalWidth, naturalHeight, quad, onChange }: CornerAdjusterProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const toNaturalPoint = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return null
    const x = Math.min(Math.max(((clientX - rect.left) / rect.width) * naturalWidth, 0), naturalWidth)
    const y = Math.min(Math.max(((clientY - rect.top) / rect.height) * naturalHeight, 0), naturalHeight)
    return { x, y }
  }

  const handlePointerDown = (index: number) => (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)

    const move = (moveEvent: PointerEvent) => {
      const point = toNaturalPoint(moveEvent.clientX, moveEvent.clientY)
      if (!point) return
      const next = [...quad] as Quad
      next[index] = point
      onChange(next)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const points = quad.map((p) => `${(p.x / naturalWidth) * 100},${(p.y / naturalHeight) * 100}`).join(' ')

  return (
    <div
      ref={containerRef}
      className="glass-strong relative w-full touch-none select-none overflow-hidden rounded-[14px]"
      style={{ aspectRatio: `${naturalWidth} / ${naturalHeight}` }}
    >
      <img src={imageUrl} alt="Captured page" className="pointer-events-none absolute inset-0 size-full object-cover" />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full"
      >
        <polygon points={points} fill="rgba(56,189,248,0.18)" stroke="rgb(56,189,248)" strokeWidth={0.6} />
      </svg>
      {quad.map((point, index) => (
        <button
          key={index}
          type="button"
          aria-label={HANDLE_LABELS[index]}
          onPointerDown={handlePointerDown(index)}
          className="focus-ring absolute flex size-7 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 border-sky-400 bg-white/90 shadow-md active:cursor-grabbing"
          style={{ left: `${(point.x / naturalWidth) * 100}%`, top: `${(point.y / naturalHeight) * 100}%` }}
        />
      ))}
    </div>
  )
}
