export const APP_NAME = 'Doclee'

export const SUPPORTED_IMAGE_EXTENSIONS = [
  'png',
  'jpg',
  'jpeg',
  'webp',
  'bmp',
  'gif',
  'tiff',
  'tif',
  'heic',
  'heif',
  'svg',
] as const

export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/bmp',
  'image/gif',
  'image/tiff',
  'image/heic',
  'image/heif',
  'image/svg+xml',
] as const

/** Display labels for the formats we accept — shown as badges near image upload entry points. */
export const SUPPORTED_IMAGE_LABELS = ['PNG', 'JPG', 'JPEG', 'WEBP', 'BMP', 'GIF', 'TIFF', 'HEIC', 'SVG']

export const MAX_UNDO_STACK_SIZE = 50

export const AUTOSAVE_DEBOUNCE_MS = 650

export const DOCUMENT_STORE_STORAGE_KEY = 'doclee.document.v1'
