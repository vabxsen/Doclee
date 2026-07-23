export interface SplitFileName {
  base: string
  extension: string
}

/** Splits "name.ext" into a base and extension (without the dot). */
export function splitFileName(name: string, fallbackExtension = 'pdf'): SplitFileName {
  const dotIndex = name.lastIndexOf('.')
  if (dotIndex <= 0) return { base: name, extension: fallbackExtension }
  return { base: name.slice(0, dotIndex), extension: name.slice(dotIndex + 1) || fallbackExtension }
}
