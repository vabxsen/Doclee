import {
  MARGIN_PRESETS_PT,
  PAGE_SIZES_PT,
  type HorizontalAlign,
  type ImageAlignment,
  type ImageFit,
  type PageDimensionsPt,
  type PdfSettings,
  type VerticalAlign,
} from '@/types/pdf'

export function getPageSizePt(settings: PdfSettings): PageDimensionsPt {
  const base =
    settings.pageSize === 'custom' ? settings.customPageSizePt : PAGE_SIZES_PT[settings.pageSize]
  const long = Math.max(base.width, base.height)
  const short = Math.min(base.width, base.height)
  return settings.orientation === 'landscape'
    ? { width: long, height: short }
    : { width: short, height: long }
}

export function getMarginPt(settings: PdfSettings): number {
  return settings.marginPreset === 'custom' ? settings.customMarginPt : MARGIN_PRESETS_PT[settings.marginPreset]
}

export interface ContentAreaPt {
  x: number
  y: number
  width: number
  height: number
}

/** The drawable area inside the page margins, in PDF points (origin bottom-left, matching pdf-lib). */
export function getContentAreaPt(settings: PdfSettings): ContentAreaPt {
  const page = getPageSizePt(settings)
  const margin = getMarginPt(settings)
  return {
    x: margin,
    y: margin,
    width: Math.max(1, page.width - margin * 2),
    height: Math.max(1, page.height - margin * 2),
  }
}

export interface PlacementPt {
  x: number
  y: number
  width: number
  height: number
}

function resolveAnchor(
  contentArea: ContentAreaPt,
  placedWidth: number,
  placedHeight: number,
  alignment: ImageAlignment,
): { x: number; y: number } {
  const horizontal: Record<HorizontalAlign, number> = {
    left: contentArea.x,
    center: contentArea.x + (contentArea.width - placedWidth) / 2,
    right: contentArea.x + contentArea.width - placedWidth,
  }
  // PDF y-axis grows upward, so "top" is the larger y value.
  const vertical: Record<VerticalAlign, number> = {
    top: contentArea.y + contentArea.height - placedHeight,
    center: contentArea.y + (contentArea.height - placedHeight) / 2,
    bottom: contentArea.y,
  }
  return { x: horizontal[alignment.horizontal], y: vertical[alignment.vertical] }
}

/**
 * Computes where/how large to draw an already-edited raster (given in
 * points, at the export DPI) within the page's content area, per the chosen
 * fit mode. 'fill' (cover) is expected to already be pre-cropped to the
 * content area's aspect ratio by the caller — see embedImage.ts — so here it
 * simply occupies the full content area.
 */
export function computePlacement(
  imageWidthPt: number,
  imageHeightPt: number,
  contentArea: ContentAreaPt,
  fit: ImageFit,
  alignment: ImageAlignment,
): PlacementPt {
  if (fit === 'stretch' || fit === 'fill') {
    return { x: contentArea.x, y: contentArea.y, width: contentArea.width, height: contentArea.height }
  }

  if (fit === 'contain') {
    const scale = Math.min(contentArea.width / imageWidthPt, contentArea.height / imageHeightPt)
    const width = imageWidthPt * scale
    const height = imageHeightPt * scale
    const { x, y } = resolveAnchor(contentArea, width, height, alignment)
    return { x, y, width, height }
  }

  // 'center': actual size, no scaling.
  const { x, y } = resolveAnchor(contentArea, imageWidthPt, imageHeightPt, alignment)
  return { x, y, width: imageWidthPt, height: imageHeightPt }
}
