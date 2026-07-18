import { Crop, FlipHorizontal, FlipVertical, RotateCcw, RotateCw } from 'lucide-react'
import { IconButton } from '@/components/ui/IconButton'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useUiStore } from '@/store/useUiStore'
import type { Rotation } from '@/types/image'

const ROTATE_CW: Record<Rotation, Rotation> = { 0: 90, 90: 180, 180: 270, 270: 0 }
const ROTATE_CCW: Record<Rotation, Rotation> = { 0: 270, 90: 0, 180: 90, 270: 180 }

interface RotateFlipControlsProps {
  imageId: string
}

export function RotateFlipControls({ imageId }: RotateFlipControlsProps) {
  const updateImageEdits = useDocumentStore((state) => state.updateImageEdits)
  const beginTransaction = useDocumentStore((state) => state.beginImageEditsTransaction)
  const commitTransaction = useDocumentStore((state) => state.commitImageEditsTransaction)
  const isCropping = useUiStore((state) => state.isCropping)
  const setIsCropping = useUiStore((state) => state.setIsCropping)

  const apply = (updater: Parameters<typeof updateImageEdits>[1]) => {
    beginTransaction(imageId)
    updateImageEdits(imageId, updater)
    commitTransaction(imageId)
  }

  return (
    <div className="flex items-center gap-1.5">
      <IconButton
        icon={<Crop className="size-4" />}
        label="Crop"
        active={isCropping}
        onClick={() => setIsCropping(!isCropping)}
      />
      <IconButton
        icon={<RotateCcw className="size-4" />}
        label="Rotate left"
        onClick={() => apply((edits) => ({ ...edits, rotation: ROTATE_CCW[edits.rotation] }))}
      />
      <IconButton
        icon={<RotateCw className="size-4" />}
        label="Rotate right"
        onClick={() => apply((edits) => ({ ...edits, rotation: ROTATE_CW[edits.rotation] }))}
      />
      <IconButton
        icon={<FlipHorizontal className="size-4" />}
        label="Flip horizontal"
        onClick={() => apply((edits) => ({ ...edits, flipH: !edits.flipH }))}
      />
      <IconButton
        icon={<FlipVertical className="size-4" />}
        label="Flip vertical"
        onClick={() => apply((edits) => ({ ...edits, flipV: !edits.flipV }))}
      />
    </div>
  )
}
