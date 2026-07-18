import { useDocumentStore } from '@/store/useDocumentStore'
import { useUiStore } from '@/store/useUiStore'
import { useCanvasRenderer } from '@/hooks/useCanvasRenderer'
import { CropTool } from '@/components/editor/CropTool'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ImageOff } from 'lucide-react'
import type { CropRect } from '@/types/image'

const PREVIEW_MAX_DIMENSION = 1600

export function CanvasPreview() {
  const images = useDocumentStore((state) => state.images)
  const activeImageId = useDocumentStore((state) => state.activeImageId)
  const updateImageEdits = useDocumentStore((state) => state.updateImageEdits)
  const beginTransaction = useDocumentStore((state) => state.beginImageEditsTransaction)
  const commitTransaction = useDocumentStore((state) => state.commitImageEditsTransaction)
  const isCropping = useUiStore((state) => state.isCropping)
  const zoom = useUiStore((state) => state.zoom)

  const activeAsset = images.find((image) => image.id === activeImageId)

  const { url, loading } = useCanvasRenderer(activeAsset, {
    maxDimension: PREVIEW_MAX_DIMENSION,
    ignoreCrop: isCropping,
  })

  if (!activeAsset) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState icon={<ImageOff className="size-6" />} title="No image selected" />
      </div>
    )
  }

  const handleCropChange = (crop: CropRect) => {
    updateImageEdits(activeAsset.id, (edits) => ({ ...edits, crop }))
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-auto bg-base-secondary p-4 sm:p-8">
      <div
        className="relative max-h-full max-w-full"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
      >
        {loading || !url ? (
          <div className="flex size-96 items-center justify-center">
            <Spinner size={28} />
          </div>
        ) : (
          <img
            src={url}
            alt={activeAsset.fileName}
            className="max-h-[75svh] w-auto rounded-[4px] object-contain shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
          />
        )}
        {isCropping && url && (
          <CropTool
            crop={activeAsset.edits.crop}
            onChange={handleCropChange}
            onCommitStart={() => beginTransaction(activeAsset.id)}
            onCommitEnd={() => commitTransaction(activeAsset.id)}
          />
        )}
      </div>
    </div>
  )
}
