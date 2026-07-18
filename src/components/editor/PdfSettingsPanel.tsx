import { useDocumentStore } from '@/store/useDocumentStore'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Slider } from '@/components/ui/Slider'
import type {
  CompressionLevel,
  HorizontalAlign,
  ImageFit,
  MarginPreset,
  Orientation,
  OutputQualityPreset,
  PageBackground,
  PageSizeId,
  PdfSettings,
  VerticalAlign,
} from '@/types/pdf'

const PAGE_SIZE_OPTIONS: { value: PageSizeId; label: string }[] = [
  { value: 'a4', label: 'A4' },
  { value: 'a3', label: 'A3' },
  { value: 'a5', label: 'A5' },
  { value: 'letter', label: 'Letter' },
  { value: 'legal', label: 'Legal' },
  { value: 'tabloid', label: 'Tabloid' },
  { value: 'custom', label: 'Custom' },
]

const ORIENTATION_OPTIONS: { value: Orientation; label: string }[] = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
]

const MARGIN_OPTIONS: { value: MarginPreset; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'custom', label: 'Custom' },
]

const BACKGROUND_OPTIONS: { value: PageBackground; label: string }[] = [
  { value: 'white', label: 'White' },
  { value: 'black', label: 'Black' },
  { value: 'transparent', label: 'Transparent' },
]

const FIT_OPTIONS: { value: ImageFit; label: string }[] = [
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill (cover)' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'center', label: 'Center (actual size)' },
]

const HORIZONTAL_OPTIONS: { value: HorizontalAlign; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
]

const VERTICAL_OPTIONS: { value: VerticalAlign; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
]

const COMPRESSION_OPTIONS: { value: CompressionLevel; label: string }[] = [
  { value: 'none', label: 'None (lossless)' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const QUALITY_OPTIONS: { value: OutputQualityPreset; label: string }[] = [
  { value: 'maximum', label: 'Maximum' },
  { value: '300', label: '300 DPI' },
  { value: '600', label: '600 DPI' },
  { value: '1200', label: '1200 DPI' },
  { value: 'custom', label: 'Custom DPI' },
]

function SectionLabel({ children }: { children: string }) {
  return <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">{children}</p>
}

export function PdfSettingsPanel() {
  const settings = useDocumentStore((state) => state.pdfSettings)
  const beginTransaction = useDocumentStore((state) => state.beginPdfSettingsTransaction)
  const updateSettings = useDocumentStore((state) => state.updatePdfSettings)
  const commitTransaction = useDocumentStore((state) => state.commitPdfSettingsTransaction)

  const commit = (updater: (settings: PdfSettings) => PdfSettings) => {
    beginTransaction()
    updateSettings(updater)
    commitTransaction()
  }

  return (
    <div className="flex flex-col gap-6 p-5">
      <section>
        <SectionLabel>Page</SectionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          <Select
            label="Size"
            options={PAGE_SIZE_OPTIONS}
            value={settings.pageSize}
            onChange={(event) =>
              commit((prev) => ({ ...prev, pageSize: event.target.value as PageSizeId }))
            }
          />
          <Select
            label="Orientation"
            options={ORIENTATION_OPTIONS}
            value={settings.orientation}
            onChange={(event) =>
              commit((prev) => ({ ...prev, orientation: event.target.value as Orientation }))
            }
          />
        </div>
      </section>

      <section>
        <SectionLabel>Margins</SectionLabel>
        <Select
          options={MARGIN_OPTIONS}
          value={settings.marginPreset}
          onChange={(event) =>
            commit((prev) => ({ ...prev, marginPreset: event.target.value as MarginPreset }))
          }
        />
        {settings.marginPreset === 'custom' && (
          <div className="mt-2.5">
            <Slider
              label="Custom margin"
              valueLabel={`${settings.customMarginPt}pt`}
              min={0}
              max={144}
              value={settings.customMarginPt}
              onChange={(event) =>
                commit((prev) => ({ ...prev, customMarginPt: Number(event.target.value) }))
              }
            />
          </div>
        )}
      </section>

      <section>
        <SectionLabel>Background</SectionLabel>
        <Select
          options={BACKGROUND_OPTIONS}
          value={settings.background}
          onChange={(event) =>
            commit((prev) => ({ ...prev, background: event.target.value as PageBackground }))
          }
        />
      </section>

      <section>
        <SectionLabel>Image Fit &amp; Alignment</SectionLabel>
        <div className="flex flex-col gap-2.5">
          <Select
            label="Fit"
            options={FIT_OPTIONS}
            value={settings.imageFit}
            onChange={(event) => commit((prev) => ({ ...prev, imageFit: event.target.value as ImageFit }))}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <Select
              label="Horizontal"
              options={HORIZONTAL_OPTIONS}
              value={settings.alignment.horizontal}
              onChange={(event) =>
                commit((prev) => ({
                  ...prev,
                  alignment: { ...prev.alignment, horizontal: event.target.value as HorizontalAlign },
                }))
              }
            />
            <Select
              label="Vertical"
              options={VERTICAL_OPTIONS}
              value={settings.alignment.vertical}
              onChange={(event) =>
                commit((prev) => ({
                  ...prev,
                  alignment: { ...prev.alignment, vertical: event.target.value as VerticalAlign },
                }))
              }
            />
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Compression &amp; Quality</SectionLabel>
        <div className="flex flex-col gap-2.5">
          <Select
            label="Compression"
            options={COMPRESSION_OPTIONS}
            value={settings.compression}
            onChange={(event) =>
              commit((prev) => ({ ...prev, compression: event.target.value as CompressionLevel }))
            }
          />
          <Select
            label="Output quality"
            options={QUALITY_OPTIONS}
            value={settings.outputQuality}
            onChange={(event) =>
              commit((prev) => ({ ...prev, outputQuality: event.target.value as OutputQualityPreset }))
            }
          />
          {settings.outputQuality === 'custom' && (
            <Slider
              label="Custom DPI"
              valueLabel={`${settings.customDpi} DPI`}
              min={72}
              max={2400}
              step={12}
              value={settings.customDpi}
              onChange={(event) => commit((prev) => ({ ...prev, customDpi: Number(event.target.value) }))}
            />
          )}
        </div>
      </section>

      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <SectionLabel>Page Numbers</SectionLabel>
          <Switch
            checked={settings.pageNumbers.enabled}
            onCheckedChange={(checked) =>
              commit((prev) => ({ ...prev, pageNumbers: { ...prev.pageNumbers, enabled: checked } }))
            }
          />
        </div>
        {settings.pageNumbers.enabled && (
          <Select
            label="Position"
            options={VERTICAL_OPTIONS}
            value={settings.pageNumbers.position}
            onChange={(event) =>
              commit((prev) => ({
                ...prev,
                pageNumbers: { ...prev.pageNumbers, position: event.target.value as VerticalAlign },
              }))
            }
          />
        )}
      </section>

      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <SectionLabel>Watermark</SectionLabel>
          <Switch
            checked={settings.watermark.enabled}
            onCheckedChange={(checked) =>
              commit((prev) => ({ ...prev, watermark: { ...prev.watermark, enabled: checked } }))
            }
          />
        </div>
        {settings.watermark.enabled && (
          <div className="flex flex-col gap-2.5">
            <input
              type="text"
              value={settings.watermark.text}
              onChange={(event) =>
                commit((prev) => ({ ...prev, watermark: { ...prev.watermark, text: event.target.value } }))
              }
              placeholder="Watermark text"
              className="focus-ring glass h-10 rounded-[14px] px-3 text-sm text-ink"
            />
            <Slider
              label="Opacity"
              valueLabel={`${Math.round(settings.watermark.opacity * 100)}%`}
              min={5}
              max={80}
              value={Math.round(settings.watermark.opacity * 100)}
              onChange={(event) =>
                commit((prev) => ({
                  ...prev,
                  watermark: { ...prev.watermark, opacity: Number(event.target.value) / 100 },
                }))
              }
            />
          </div>
        )}
      </section>

      <section>
        <SectionLabel>Metadata</SectionLabel>
        <div className="flex flex-col gap-2.5">
          {(['title', 'author', 'subject', 'keywords'] as const).map((field) => (
            <input
              key={field}
              type="text"
              value={settings.metadata[field]}
              onChange={(event) =>
                commit((prev) => ({ ...prev, metadata: { ...prev.metadata, [field]: event.target.value } }))
              }
              placeholder={field[0]!.toUpperCase() + field.slice(1)}
              className="focus-ring glass h-10 rounded-[14px] px-3 text-sm capitalize text-ink placeholder:capitalize placeholder:text-ink-muted"
            />
          ))}
        </div>
      </section>
    </div>
  )
}
