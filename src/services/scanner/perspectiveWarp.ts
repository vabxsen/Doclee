export interface Point {
  x: number
  y: number
}

/** The 4 corners of a scan region in source-image pixel space, in order: top-left, top-right, bottom-right, bottom-left. */
export type Quad = [Point, Point, Point, Point]

interface SquareToQuadCoefficients {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
  g: number
  h: number
  i: number
}

/**
 * Coefficients of the projective map from the unit square (0,0)-(1,1) onto
 * an arbitrary quadrilateral — Paul Heckbert's "square-to-quad" mapping.
 * Cheaper and more numerically stable than solving a general 8x8 system
 * since one side is fixed to the unit square.
 */
function squareToQuadCoefficients(quad: Quad): SquareToQuadCoefficients {
  const [p0, p1, p2, p3] = quad

  const dx1 = p1.x - p2.x
  const dx2 = p3.x - p2.x
  const dx3 = p0.x - p1.x + p2.x - p3.x
  const dy1 = p1.y - p2.y
  const dy2 = p3.y - p2.y
  const dy3 = p0.y - p1.y + p2.y - p3.y

  if (dx3 === 0 && dy3 === 0) {
    return {
      a: p1.x - p0.x,
      b: p2.x - p1.x,
      c: p0.x,
      d: p1.y - p0.y,
      e: p2.y - p1.y,
      f: p0.y,
      g: 0,
      h: 0,
      i: 1,
    }
  }

  const denom = dx1 * dy2 - dx2 * dy1
  const g = (dx3 * dy2 - dx2 * dy3) / denom
  const h = (dx1 * dy3 - dx3 * dy1) / denom

  return {
    a: p1.x - p0.x + g * p1.x,
    b: p3.x - p0.x + h * p3.x,
    c: p0.x,
    d: p1.y - p0.y + g * p1.y,
    e: p3.y - p0.y + h * p3.y,
    f: p0.y,
    g,
    h,
    i: 1,
  }
}

/** Maps a unit-square point (u,v in [0,1]) to its position inside the quad. */
function mapUnitSquareToQuad(m: SquareToQuadCoefficients, u: number, v: number): Point {
  const denom = m.g * u + m.h * v + m.i
  return { x: (m.a * u + m.b * v + m.c) / denom, y: (m.d * u + m.e * v + m.f) / denom }
}

/** Bilinear-samples `source` (via its pixel data) at fractional coordinates. */
function sampleBilinear(data: Uint8ClampedArray, width: number, height: number, x: number, y: number): number[] {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = Math.min(x0 + 1, width - 1)
  const y1 = Math.min(y0 + 1, height - 1)
  const clampedX0 = Math.min(Math.max(x0, 0), width - 1)
  const clampedY0 = Math.min(Math.max(y0, 0), height - 1)
  const tx = x - x0
  const ty = y - y0

  const i00 = (clampedY0 * width + clampedX0) * 4
  const i10 = (clampedY0 * width + x1) * 4
  const i01 = (y1 * width + clampedX0) * 4
  const i11 = (y1 * width + x1) * 4

  const out = [0, 0, 0, 0]
  for (let c = 0; c < 4; c++) {
    const top = data[i00 + c]! * (1 - tx) + data[i10 + c]! * tx
    const bottom = data[i01 + c]! * (1 - tx) + data[i11 + c]! * tx
    out[c] = top * (1 - ty) + bottom * ty
  }
  return out
}

/**
 * Straightens the quad region of `source` into an `outputWidth` x
 * `outputHeight` rectangular canvas — the classic "scan flattening"
 * perspective correction, done via inverse mapping + bilinear sampling.
 */
export function warpQuadToRect(
  source: HTMLCanvasElement,
  quad: Quad,
  outputWidth: number,
  outputHeight: number,
): HTMLCanvasElement {
  const srcCtx = source.getContext('2d')
  if (!srcCtx) throw new Error('Canvas 2D context unavailable')
  const srcData = srcCtx.getImageData(0, 0, source.width, source.height).data

  const mapping = squareToQuadCoefficients(quad)

  const outCanvas = document.createElement('canvas')
  outCanvas.width = outputWidth
  outCanvas.height = outputHeight
  const outCtx = outCanvas.getContext('2d')
  if (!outCtx) throw new Error('Canvas 2D context unavailable')
  const outImage = outCtx.createImageData(outputWidth, outputHeight)

  for (let y = 0; y < outputHeight; y++) {
    const v = (y + 0.5) / outputHeight
    for (let x = 0; x < outputWidth; x++) {
      const u = (x + 0.5) / outputWidth
      const { x: sx, y: sy } = mapUnitSquareToQuad(mapping, u, v)
      const outIndex = (y * outputWidth + x) * 4

      if (sx < 0 || sy < 0 || sx > source.width - 1 || sy > source.height - 1) {
        outImage.data[outIndex + 3] = 0
        continue
      }

      const [r, g, b, a] = sampleBilinear(srcData, source.width, source.height, sx, sy)
      outImage.data[outIndex] = r!
      outImage.data[outIndex + 1] = g!
      outImage.data[outIndex + 2] = b!
      outImage.data[outIndex + 3] = a!
    }
  }

  outCtx.putImageData(outImage, 0, 0)
  return outCanvas
}

/** Estimates a sensible flattened output size from the quad's own edge lengths, capped to a max long edge. */
export function estimateOutputSize(quad: Quad, maxLongEdge = 2200): { width: number; height: number } {
  const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)
  const topWidth = distance(quad[0], quad[1])
  const bottomWidth = distance(quad[3], quad[2])
  const leftHeight = distance(quad[0], quad[3])
  const rightHeight = distance(quad[1], quad[2])

  let width = Math.max(1, Math.round((topWidth + bottomWidth) / 2))
  let height = Math.max(1, Math.round((leftHeight + rightHeight) / 2))

  const longEdge = Math.max(width, height)
  if (longEdge > maxLongEdge) {
    const scale = maxLongEdge / longEdge
    width = Math.max(1, Math.round(width * scale))
    height = Math.max(1, Math.round(height * scale))
  }

  return { width, height }
}

/** A sensible default quad inset a few percent from the full image bounds. */
export function defaultQuadForSize(width: number, height: number): Quad {
  const insetX = width * 0.06
  const insetY = height * 0.06
  return [
    { x: insetX, y: insetY },
    { x: width - insetX, y: insetY },
    { x: width - insetX, y: height - insetY },
    { x: insetX, y: height - insetY },
  ]
}
