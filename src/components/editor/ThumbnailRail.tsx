import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { ThumbnailCard } from '@/components/editor/ThumbnailCard'
import { AddImagesTile } from '@/components/editor/AddImagesTile'

export function ThumbnailRail() {
  const images = useDocumentStore((state) => state.images)
  const activeImageId = useDocumentStore((state) => state.activeImageId)
  const reorderImages = useDocumentStore((state) => state.reorderImages)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = images.findIndex((image) => image.id === active.id)
    const newIndex = images.findIndex((image) => image.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    reorderImages(arrayMove(images, oldIndex, newIndex).map((image) => image.id))
  }

  return (
    <aside className="h-24 w-full shrink-0 overflow-x-auto overflow-y-hidden border-b border-border-glass px-3 py-3 md:h-full md:w-[168px] md:overflow-x-hidden md:overflow-y-auto md:border-b-0 md:border-r md:py-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={images.map((image) => image.id)}
          strategy={isDesktop ? verticalListSortingStrategy : horizontalListSortingStrategy}
        >
          <div className="flex gap-2.5 md:grid md:grid-cols-2">
            {images.map((image, index) => (
              <ThumbnailCard key={image.id} asset={image} index={index} active={image.id === activeImageId} />
            ))}
            <AddImagesTile />
          </div>
        </SortableContext>
      </DndContext>
    </aside>
  )
}
