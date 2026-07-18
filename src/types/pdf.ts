export type PageSizeId = 'a4' | 'a3' | 'a5' | 'letter' | 'legal' | 'tabloid' | 'custom'

export interface PageDimensionsPt {
  width: number
  height: number
}

/** Page sizes in PostScript points (1pt = 1/72in), portrait orientation. */
export const PAGE_SIZES_PT: Record<Exclude<PageSizeId, 'custom'>, PageDimensionsPt> = {
  a4: { width: 595.28, height: 841.89 },
  a3: { width: 841.89, height: 1190.55 },
  a5: { width: 419.53, height: 595.28 },
  letter: { width: 612, height: 792 },
  legal: { width: 612, height: 1008 },
  tabloid: { width: 792, height: 1224 },
}

export type Orientation = 'portrait' | 'landscape'

export type MarginPreset = 'none' | 'small' | 'medium' | 'large' | 'custom'

/** Margin values in points. */
export const MARGIN_PRESETS_PT: Record<Exclude<MarginPreset, 'custom'>, number> = {
  none: 0,
  small: 18,
  medium: 36,
  large: 54,
}

export type PageBackground = 'white' | 'black' | 'transparent'

export type ImageFit = 'fill' | 'contain' | 'stretch' | 'center'

export type HorizontalAlign = 'left' | 'center' | 'right'
export type VerticalAlign = 'top' | 'center' | 'bottom'

export interface ImageAlignment {
  horizontal: HorizontalAlign
  vertical: VerticalAlign
}

export type CompressionLevel = 'none' | 'low' | 'medium' | 'high'

/** JPEG quality (0-1) used when compression is not 'none'. */
export const COMPRESSION_QUALITY: Record<Exclude<CompressionLevel, 'none'>, number> = {
  low: 0.92,
  medium: 0.8,
  high: 0.6,
}

export type OutputQualityPreset = 'maximum' | '300' | '600' | '1200' | 'custom'

/** Maps a quality preset to an effective DPI used for pixel-size calculations. */
export const OUTPUT_QUALITY_DPI: Record<Exclude<OutputQualityPreset, 'custom'>, number> = {
  maximum: 1200,
  '300': 300,
  '600': 600,
  '1200': 1200,
}

export interface PageNumberSettings {
  enabled: boolean
  format: string // e.g. '{n} / {total}'
  position: VerticalAlign
}

export interface WatermarkSettings {
  enabled: boolean
  text: string
  opacity: number // 0-1
  fontSizePt: number
  rotationDeg: number
}

export interface PdfMetadata {
  title: string
  author: string
  subject: string
  keywords: string
}

export interface PdfSettings {
  pageSize: PageSizeId
  customPageSizePt: PageDimensionsPt
  orientation: Orientation
  marginPreset: MarginPreset
  customMarginPt: number
  background: PageBackground
  imageFit: ImageFit
  alignment: ImageAlignment
  compression: CompressionLevel
  outputQuality: OutputQualityPreset
  customDpi: number
  pageNumbers: PageNumberSettings
  watermark: WatermarkSettings
  metadata: PdfMetadata
}

export const DEFAULT_PDF_SETTINGS: PdfSettings = {
  pageSize: 'a4',
  customPageSizePt: { width: 595.28, height: 841.89 },
  orientation: 'portrait',
  marginPreset: 'none',
  customMarginPt: 36,
  background: 'white',
  imageFit: 'contain',
  alignment: { horizontal: 'center', vertical: 'center' },
  compression: 'none',
  outputQuality: 'maximum',
  customDpi: 300,
  pageNumbers: { enabled: false, format: '{n} / {total}', position: 'bottom' },
  watermark: { enabled: false, text: 'Doclee', opacity: 0.2, fontSizePt: 48, rotationDeg: -45 },
  metadata: { title: '', author: '', subject: '', keywords: '' },
}
