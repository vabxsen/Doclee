import type { ImageFilters } from '@/types/image'

/**
 * Builds a CSS-filter-syntax string. Used identically for the live CSS
 * `filter` preview and the Canvas 2D `ctx.filter` at export time, so the two
 * never drift — Canvas 2D shares CSS's filter function syntax exactly.
 *
 * Effects CSS has no equivalent for (sharpen, true black & white threshold)
 * are intentionally left out here and applied afterwards as a manual pixel
 * pass — see `applyManualPixelEffects`. Black & white gets a contrast/
 * grayscale boost here so the live preview is a close approximation before
 * the real threshold pass runs at export.
 */
export function getCssFilterString(filters: ImageFilters): string {
  const parts: string[] = []

  const brightnessFactor = (1 + filters.brightness / 100) * (1 + filters.exposure / 100)
  if (brightnessFactor !== 1) parts.push(`brightness(${Math.max(0, brightnessFactor)})`)

  const contrastFactor = 1 + filters.contrast / 100 + (filters.blackAndWhite ? 0.6 : 0)
  if (contrastFactor !== 1) parts.push(`contrast(${Math.max(0, contrastFactor)})`)

  const saturateFactor = filters.blackAndWhite ? 0 : 1 + filters.saturation / 100
  if (saturateFactor !== 1) parts.push(`saturate(${Math.max(0, saturateFactor)})`)

  if (filters.hue !== 0) parts.push(`hue-rotate(${filters.hue}deg)`)
  if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`)
  if (filters.grayscale || filters.blackAndWhite) parts.push('grayscale(1)')
  if (filters.sepia) parts.push('sepia(1)')
  if (filters.invert) parts.push('invert(1)')

  return parts.length > 0 ? parts.join(' ') : 'none'
}

export function hasManualPixelEffects(filters: ImageFilters): boolean {
  return filters.sharpen > 0 || filters.blackAndWhite
}
