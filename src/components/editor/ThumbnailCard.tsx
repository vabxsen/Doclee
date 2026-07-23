import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { Copy, GripVertical, RotateCw, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useCanvasRenderer } from '@/hooks/useCanvasRenderer'
import { useDocumentStore } from '@/store/useDocumentStore'
import { ContextMenu } from '@/components/ui/ContextMenu'
import { Skeleton } from '@/components/ui/Skeleton'
import type { ImageAsset, Rotation } from '@/types/image'

interface ThumbnailCardProps {
  asset: ImageAsset
  index: number
  active: boolean
}

const NEXT_ROTATION: Record<Rotation, Rotation> = { 0: 90, 90: 180, 180: 270, 270: 0 }

function ThumbnailCardComponent({ asset, index, active }: ThumbnailCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: asset.id,
  })
  const { url, loading } = useCanvasRenderer(asset, { maxDimension: 200 })
  const setActiveImage = useDocumentStore((state) => state.setActiveImage)
  const removeImage = useDocumentStore((state) => state.removeImage)
  const duplicateImage = useDocumentStore((state) => state.duplicateImage)
  const updateImageEdits = useDocumentStore((state) => state.updateImageEdits)
  const beginTransaction = useDocumentStore((state) => state.beginImageEditsTransaction)
  const commitTransaction = useDocumentStore((state) => state.commitImageEditsTransaction)

  const rotate = () => {
    beginTransaction(asset.id)
    updateImageEdits(asset.id, (edits) => ({ ...edits, rotation: NEXT_ROTATION[edits.rotation] }))
    commitTransaction(asset.id)
  }

  return (
    <ContextMenu
      items={[
        { label: 'Rotate', icon: <RotateCw className="size-4" />, onSelect: rotate },
        { label: 'Duplicate', icon: <Copy className="size-4" />, onSelect: () => duplicateImage(asset.id) },
        {
          label: 'Delete',
          icon: <Trash2 className="size-4" />,
          onSelect: () => removeImage(asset.id),
          danger: true,
        },
      ]}
    >
      <motion.div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        layout="position"
        onClick={() => setActiveImage(asset.id)}
        className={cn(
          'group relative flex w-24 shrink-0 cursor-pointer flex-col gap-1.5 rounded-[16px] p-2 transition-colors md:w-full',
          active ? 'bg-white/10' : 'hover:bg-white/5',
          isDragging && 'z-10 opacity-70',
        )}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[12px] bg-black/40">
          {loading || !url ? (
            <Skeleton className="absolute inset-0" />
          ) : (
            <img src={url} alt={asset.fileName} className="size-full object-contain" />
          )}
          <span className="absolute bottom-1 right-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {index + 1}
          </span>
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
            className="absolute left-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <GripVertical className="size-3.5" />
          </button>
        </div>
        <p className="truncate px-0.5 text-[11px] text-ink-muted">{asset.fileName}</p>
      </motion.div>
    </ContextMenu>
  )
}

/** Memoized so dragging a slider on the active image doesn't reconcile every other thumbnail. */
export const ThumbnailCard = memo(ThumbnailCardComponent)
