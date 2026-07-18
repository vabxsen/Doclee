import { useRef, useState } from 'react'
import { clamp } from '@/utils/clamp'
import type { CropRect } from '@/types/image'

type HandlePosition = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | 'move'

interface CropToolProps {
  crop: CropRect
  onChange: (crop: CropRect) => void
  onCommitStart: () => void
  onCommitEnd: () => void
}

const HANDLES: HandlePosition[] = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']

const HANDLE_POSITION_CLASSES: Record<HandlePosition, string> = {
  nw: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
  n: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize',
  ne: 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
  w: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
  e: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
  sw: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
  s: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize',
  se: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
  move: 'cursor-move',
}

const MIN_SIZE = 0.05

export function CropTool({ crop, onChange, onCommitStart, onCommitEnd }: CropToolProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState<{ handle: HandlePosition; startCrop: CropRect; startX: number; startY: number } | null>(null)

  const beginDrag = (handle: HandlePosition) => (event: React.PointerEvent) => {
    event.stopPropagation()
    onCommitStart()
    setDragState({ handle, startCrop: crop, startX: event.clientX, startY: event.clientY })
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!dragState || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const dx = (event.clientX - dragState.startX) / rect.width
    const dy = (event.clientY - dragState.startY) / rect.height
    const { startCrop, handle } = dragState

    let { x, y, width, height } = startCrop

    if (handle === 'move') {
      x = clamp(startCrop.x + dx, 0, 1 - startCrop.width)
      y = clamp(startCrop.y + dy, 0, 1 - startCrop.height)
    } else {
      if (handle.includes('w')) {
        const newX = clamp(startCrop.x + dx, 0, startCrop.x + startCrop.width - MIN_SIZE)
        width = startCrop.x + startCrop.width - newX
        x = newX
      }
      if (handle.includes('e')) {
        width = clamp(startCrop.width + dx, MIN_SIZE, 1 - startCrop.x)
      }
      if (handle.includes('n')) {
        const newY = clamp(startCrop.y + dy, 0, startCrop.y + startCrop.height - MIN_SIZE)
        height = startCrop.y + startCrop.height - newY
        y = newY
      }
      if (handle.includes('s')) {
        height = clamp(startCrop.height + dy, MIN_SIZE, 1 - startCrop.y)
      }
    }

    onChange({ x, y, width, height })
  }

  const endDrag = () => {
    if (!dragState) return
    setDragState(null)
    onCommitEnd()
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        onPointerDown={beginDrag('move')}
        className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
        style={{
          left: `${crop.x * 100}%`,
          top: `${crop.y * 100}%`,
          width: `${crop.width * 100}%`,
          height: `${crop.height * 100}%`,
        }}
      >
        {HANDLES.map((handle) => (
          <button
            key={handle}
            type="button"
            aria-label={`Resize crop (${handle})`}
            onPointerDown={beginDrag(handle)}
            className={`absolute size-3.5 rounded-full border-2 border-black bg-white ${HANDLE_POSITION_CLASSES[handle]}`}
          />
        ))}
      </div>
    </div>
  )
}
