import { useEffect, useRef, useState } from 'react'
import type { ImageAsset } from '@/types/image'
import { getFileBlob } from '@/services/storage/localFileCache'
import { decodeImageFile } from '@/services/imageDecoding/decodeImageFile'
import { renderEditedImage } from '@/services/imageProcessing/cropRotateFlip'
import { canvasToBlob } from '@/services/imageProcessing/canvasToBlob'

interface UseRenderedImageOptions {
  maxDimension?: number
  /** Renders the full rotated/flipped/filtered image ignoring the crop rect — used by the crop tool. */
  ignoreCrop?: boolean
}

interface RenderedImage {
  url: string | null
  loading: boolean
}

/**
 * Decodes the asset's source blob and re-renders it (crop/rotate/flip/
 * filters) at a capped preview resolution whenever the edits change.
 * Full-resolution rendering happens separately at export time.
 */
export function useCanvasRenderer(
  asset: ImageAsset | undefined,
  options: UseRenderedImageOptions = {},
): RenderedImage {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const objectUrlRef = useRef<string | null>(null)
  const maxDimension = options.maxDimension
  const ignoreCrop = options.ignoreCrop

  useEffect(() => {
    let cancelled = false

    async function render() {
      if (!asset) {
        setUrl(null)
        return
      }
      setLoading(true)
      try {
        const blob = await getFileBlob(asset.blobRefId)
        if (!blob || cancelled) return
        const file = new File([blob], asset.fileName, { type: asset.mimeType })
        const { bitmap } = await decodeImageFile(file)
        if (cancelled) return
        const canvas = renderEditedImage(bitmap, asset.edits, { maxDimension, ignoreCrop })
        const renderedBlob = await canvasToBlob(canvas, 'image/png')
        if (cancelled) return

        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
        const nextUrl = URL.createObjectURL(renderedBlob)
        objectUrlRef.current = nextUrl
        setUrl(nextUrl)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void render()
    return () => {
      cancelled = true
    }
  }, [asset, maxDimension, ignoreCrop])

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    },
    [],
  )

  return { url, loading }
}
