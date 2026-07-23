import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Layers, GripVertical, X } from 'lucide-react'
import { ToolPageHeader } from '@/components/tools/ToolPageHeader'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { PdfDropzone } from '@/components/tools/PdfDropzone'
import { ResultCard } from '@/components/tools/ResultCard'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { downloadBlob } from '@/utils/download'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'

interface QueuedFile {
  id: string
  file: File
}

const tool = getToolBySlug('merge-pdf')!

function SortableFileRow({ entry, onRemove }: { entry: QueuedFile; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 transition-colors hover:bg-white/5 ${
        isDragging ? 'z-10 bg-white/8 opacity-70' : ''
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="flex size-8 shrink-0 cursor-grab items-center justify-center rounded-[10px] text-ink-muted hover:bg-white/8 hover:text-ink"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white/8 text-ink">
        <Layers className="size-4" />
      </span>
      <p className="min-w-0 flex-1 truncate text-sm text-ink">{entry.file.name}</p>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="flex size-8 shrink-0 items-center justify-center rounded-[10px] text-ink-muted hover:bg-white/8 hover:text-ink"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export function MergePdfPage() {
  const [queue, setQueue] = useState<QueuedFile[]>([])
  const [merging, setMerging] = useState(false)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const handleFilesAccepted = (files: File[]) => {
    setQueue((prev) => [...prev, ...files.map((file) => ({ id: crypto.randomUUID(), file }))])
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setQueue((prev) => {
      const oldIndex = prev.findIndex((entry) => entry.id === active.id)
      const newIndex = prev.findIndex((entry) => entry.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  const handleMerge = async () => {
    if (queue.length < 2) {
      toast.error('Add at least two PDFs to merge')
      return
    }
    setMerging(true)
    try {
      const merged = await PDFDocument.create()
      for (const entry of queue) {
        const bytes = await entry.file.arrayBuffer()
        const source = await PDFDocument.load(bytes)
        const copiedPages = await merged.copyPages(source, source.getPageIndices())
        copiedPages.forEach((page) => merged.addPage(page))
      }
      const bytes = await merged.save()
      setResultBlob(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }))
      toast.success('PDFs merged')
    } catch {
      toast.error("Couldn't merge those PDFs — make sure every file is a valid PDF")
    } finally {
      setMerging(false)
    }
  }

  const reset = () => {
    setQueue([])
    setResultBlob(null)
  }

  return (
    <ToolPageLayout>
      <ToolPageHeader icon={tool.icon} title={tool.title} description={tool.description} />

      {resultBlob ? (
        <ResultCard
          title="Merge complete"
          description={`Combined ${queue.length} PDFs into one document.`}
          onDownload={(fileName) => downloadBlob(resultBlob, fileName)}
          onReset={reset}
          resultBlob={resultBlob}
          resultFileName="merged.pdf"
        />
      ) : (
        <>
          <PdfDropzone onFilesAccepted={handleFilesAccepted} multiple label="Drop PDFs here" />

          {queue.length > 0 && (
            <GlassCard className="flex flex-col gap-1 p-3">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={queue.map((entry) => entry.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {queue.map((entry) => (
                    <SortableFileRow
                      key={entry.id}
                      entry={entry}
                      onRemove={() =>
                        setQueue((prev) => prev.filter((item) => item.id !== entry.id))
                      }
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </GlassCard>
          )}

          <Button
            className="self-center"
            disabled={queue.length < 2}
            loading={merging}
            onClick={() => void handleMerge()}
          >
            Merge {queue.length > 0 ? `${queue.length} PDFs` : 'PDFs'}
          </Button>
        </>
      )}
    </ToolPageLayout>
  )
}
