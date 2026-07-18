export interface CropRect {
  /** 0-1 fractional offset from left of the source image */
  x: number
  /** 0-1 fractional offset from top of the source image */
  y: number
  /** 0-1 fractional width of the source image */
  width: number
  /** 0-1 fractional height of the source image */
  height: number
}

export const FULL_CROP: CropRect = { x: 0, y: 0, width: 1, height: 1 }

export type Rotation = 0 | 90 | 180 | 270

export interface ImageFilters {
  brightness: number // -100..100, 0 = neutral
  contrast: number // -100..100
  saturation: number // -100..100
  hue: number // -180..180 degrees
  exposure: number // -100..100
  sharpen: number // 0..100
  blur: number // 0..20 px
  grayscale: boolean
  blackAndWhite: boolean
  sepia: boolean
  invert: boolean
}

export const DEFAULT_FILTERS: ImageFilters = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  exposure: 0,
  sharpen: 0,
  blur: 0,
  grayscale: false,
  blackAndWhite: false,
  sepia: false,
  invert: false,
}

export interface ImageEdits {
  crop: CropRect
  rotation: Rotation
  flipH: boolean
  flipV: boolean
  filters: ImageFilters
}

export const DEFAULT_EDITS: ImageEdits = {
  crop: FULL_CROP,
  rotation: 0,
  flipH: false,
  flipV: false,
  filters: DEFAULT_FILTERS,
}

export interface ImageAsset {
  id: string
  fileName: string
  mimeType: string
  /** Key into the IndexedDB blob cache holding the original file bytes */
  blobRefId: string
  naturalWidth: number
  naturalHeight: number
  edits: ImageEdits
  createdAt: number
}
