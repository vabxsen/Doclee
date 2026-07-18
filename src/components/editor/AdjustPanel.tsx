import { useDocumentStore } from '@/store/useDocumentStore'
import { Slider } from '@/components/ui/Slider'
import { Switch } from '@/components/ui/Switch'
import { RotateFlipControls } from '@/components/editor/RotateFlipControls'
import { FilterPresetGrid } from '@/components/editor/FilterPresetGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { ImageOff } from 'lucide-react'
import type { ImageFilters } from '@/types/image'

const SLIDER_FIELDS: {
  key: keyof Pick<ImageFilters, 'brightness' | 'contrast' | 'saturation' | 'hue' | 'exposure' | 'sharpen' | 'blur'>
  label: string
  min: number
  max: number
}[] = [
  { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
  { key: 'hue', label: 'Hue', min: -180, max: 180 },
  { key: 'exposure', label: 'Exposure', min: -100, max: 100 },
  { key: 'sharpen', label: 'Sharpen', min: 0, max: 100 },
  { key: 'blur', label: 'Blur', min: 0, max: 20 },
]

const SWITCH_FIELDS: { key: keyof Pick<ImageFilters, 'grayscale' | 'blackAndWhite' | 'sepia' | 'invert'>; label: string }[] = [
  { key: 'grayscale', label: 'Grayscale' },
  { key: 'blackAndWhite', label: 'Black & White' },
  { key: 'sepia', label: 'Sepia' },
  { key: 'invert', label: 'Invert' },
]

export function AdjustPanel() {
  const images = useDocumentStore((state) => state.images)
  const activeImageId = useDocumentStore((state) => state.activeImageId)
  const updateImageEdits = useDocumentStore((state) => state.updateImageEdits)
  const beginTransaction = useDocumentStore((state) => state.beginImageEditsTransaction)
  const commitTransaction = useDocumentStore((state) => state.commitImageEditsTransaction)

  const activeAsset = images.find((image) => image.id === activeImageId)

  if (!activeAsset) {
    return (
      <div className="p-5">
        <EmptyState icon={<ImageOff className="size-5" />} title="Select an image to edit" />
      </div>
    )
  }

  const setFilters = (updater: (filters: ImageFilters) => ImageFilters) => {
    updateImageEdits(activeAsset.id, (edits) => ({ ...edits, filters: updater(edits.filters) }))
  }

  return (
    <div className="flex flex-col gap-6 p-5">
      <section>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Transform</p>
        <RotateFlipControls imageId={activeAsset.id} />
      </section>

      <section>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Presets</p>
        <FilterPresetGrid
          onApply={(filters) => {
            beginTransaction(activeAsset.id)
            setFilters(() => filters)
            commitTransaction(activeAsset.id)
          }}
        />
      </section>

      <section className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Adjust</p>
        {SLIDER_FIELDS.map((field) => (
          <Slider
            key={field.key}
            label={field.label}
            valueLabel={String(activeAsset.edits.filters[field.key])}
            min={field.min}
            max={field.max}
            value={activeAsset.edits.filters[field.key]}
            onPointerDown={() => beginTransaction(activeAsset.id)}
            onChange={(event) => {
              const value = Number(event.target.value)
              setFilters((filters) => ({ ...filters, [field.key]: value }))
            }}
            onPointerUp={() => commitTransaction(activeAsset.id)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Effects</p>
        {SWITCH_FIELDS.map((field) => (
          <Switch
            key={field.key}
            label={field.label}
            checked={activeAsset.edits.filters[field.key]}
            onCheckedChange={(checked) => {
              beginTransaction(activeAsset.id)
              setFilters((filters) => ({ ...filters, [field.key]: checked }))
              commitTransaction(activeAsset.id)
            }}
          />
        ))}
      </section>
    </div>
  )
}
