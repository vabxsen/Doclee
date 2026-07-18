import { DEFAULT_FILTERS, type ImageFilters } from '@/types/image'
import { cn } from '@/lib/cn'

interface FilterPreset {
  label: string
  filters: ImageFilters
}

const PRESETS: FilterPreset[] = [
  { label: 'Original', filters: DEFAULT_FILTERS },
  { label: 'Grayscale', filters: { ...DEFAULT_FILTERS, grayscale: true } },
  { label: 'Black & White', filters: { ...DEFAULT_FILTERS, blackAndWhite: true } },
  { label: 'Sepia', filters: { ...DEFAULT_FILTERS, sepia: true } },
  { label: 'Vivid', filters: { ...DEFAULT_FILTERS, contrast: 20, saturation: 30 } },
  { label: 'Invert', filters: { ...DEFAULT_FILTERS, invert: true } },
]

interface FilterPresetGridProps {
  onApply: (filters: ImageFilters) => void
}

export function FilterPresetGrid({ onApply }: FilterPresetGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {PRESETS.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => onApply(preset.filters)}
          className={cn(
            'focus-ring glass rounded-[12px] px-2 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-glass-strong hover:text-ink',
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}
