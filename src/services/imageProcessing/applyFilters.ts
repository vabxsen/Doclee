import type { ImageFilters } from '@/types/image'
import { clamp } from '@/utils/clamp'

const SHARPEN_KERNEL = [0, -1, 0, -1, 5, -1, 0, -1, 0]

function applySharpen(source: ImageData, amount: number): ImageData {
  const { width, height, data } = source
  const output = new Uint8ClampedArray(data.length)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * 4
      for (let channel = 0; channel < 3; channel++) {
        let sum = 0
        let kernelIndex = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const sampleY = clamp(y + ky, 0, height - 1)
            const sampleX = clamp(x + kx, 0, width - 1)
            sum += data[(sampleY * width + sampleX) * 4 + channel]! * SHARPEN_KERNEL[kernelIndex]!
            kernelIndex++
          }
        }
        const original = data[pixelIndex + channel]!
        const sharpened = clamp(sum, 0, 255)
        output[pixelIndex + channel] = clamp(original * (1 - amount) + sharpened * amount, 0, 255)
      }
      output[pixelIndex + 3] = data[pixelIndex + 3]!
    }
  }

  return new ImageData(output, width, height)
}

function applyBlackAndWhiteThreshold(source: ImageData, threshold = 128): ImageData {
  const { width, height, data } = source
  const output = new Uint8ClampedArray(data.length)

  for (let i = 0; i < data.length; i += 4) {
    const luminance = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!
    const value = luminance > threshold ? 255 : 0
    output[i] = value
    output[i + 1] = value
    output[i + 2] = value
    output[i + 3] = data[i + 3]!
  }

  return new ImageData(output, width, height)
}

/**
 * Applies the effects the CSS/Canvas `filter` string can't express. Expected
 * to run on an already `ctx.filter`-drawn ImageData (see filterDefinitions.ts)
 * so brightness/contrast/etc. are already baked in.
 */
export function applyManualPixelEffects(imageData: ImageData, filters: ImageFilters): ImageData {
  let result = imageData
  if (filters.sharpen > 0) {
    result = applySharpen(result, filters.sharpen / 100)
  }
  if (filters.blackAndWhite) {
    result = applyBlackAndWhiteThreshold(result)
  }
  return result
}
