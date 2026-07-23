import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { ImageAsset } from '@/types/image'
import { getFileBlob } from '@/services/storage/localFileCache'
import { decodeImageFile } from '@/services/imageDecoding/decodeImageFile'
import { renderEditedImage } from '@/services/imageProcessing/cropRotateFlip'
import { canvasToBlob } from '@/services/imageProcessing/canvasToBlob'

interface UseRenderedImageOptions {
  maxDimension?: number
  /** Renders the full rotated/flipped/filtered image ignoring the crop rect — used by the crop tool. */
  ignoreCrop?: boolean
  /**
   * When set, edits are drawn straight into this canvas instead of encoding
   * a PNG blob URL — for a live preview that redraws on every slider tick
   * without paying for PNG encode + object-URL churn + an `<img>` re-decode
   * each time. `url`/`loading` are unused in this mode.
   */
  targetCanvasRef?: RefObject<HTMLCanvasElement | null>
}

interface RenderedImage {
  url: string | null
  loading: boolean
}

interface DrawParams {
  asset: ImageAsset
  maxDimension: number | undefined
  ignoreCrop: boolean | undefined
}

/**
 * Decodes the asset's source blob once per asset — cached in a ref, keyed on
 * blobRefId — and redraws crop/rotate/flip/filters from that cached bitmap
 * whenever edits change. Decoding (IndexedDB read + image decode) is by far
 * the most expensive step, so a slider drag must not re-trigger it on every
 * tick; only the draw itself re-runs. Redraws are coalesced so a fast drag
 * never has more than one draw running plus one pending — newer ticks that
 * arrive mid-draw just update what "latest" means, they don't queue up.
 * Full-resolution rendering happens separately at export time.
 */
export function useCanvasRenderer(
  asset: ImageAsset | undefined,
  options: UseRenderedImageOptions = {},
): RenderedImage {
  const [url, setUrl] = useState<string | null>(null)
  // Starts true whenever there's an asset to decode, so the very first paint
  // (before any effect has run) doesn't briefly show stale/empty content.
  const [loading, setLoading] = useState(() => asset !== undefined)
  const [bitmapVersion, setBitmapVersion] = useState(0)

  const objectUrlRef = useRef<string | null>(null)
  const bitmapRef = useRef<{ blobRefId: string; bitmap: ImageBitmap } | null>(null)
  const mountedRef = useRef(false)
  const runningRef = useRef(false)
  const pendingRef = useRef(false)
  const latestParamsRef = useRef<DrawParams | null>(null)

  const { maxDimension, ignoreCrop, targetCanvasRef } = options
  const blobRefId = asset?.blobRefId
  const fileName = asset?.fileName
  const mimeType = asset?.mimeType

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Decode: only re-fetches + re-decodes the source image when the
  // underlying file changes (blobRefId is stable across edits).
  useEffect(() => {
    if (!blobRefId || !fileName) {
      if (bitmapRef.current) {
        bitmapRef.current.bitmap.close()
        bitmapRef.current = null
        setBitmapVersion((v) => v + 1)
      }
      setLoading(false)
      return
    }
    if (bitmapRef.current?.blobRefId === blobRefId) return

    let cancelled = false
    setLoading(true)

    async function decode() {
      const blob = await getFileBlob(blobRefId!)
      if (!blob || cancelled) return
      const file = new File([blob], fileName!, { type: mimeType })
      const { bitmap } = await decodeImageFile(file)
      if (cancelled) {
        bitmap.close()
        return
      }
      bitmapRef.current?.bitmap.close()
      bitmapRef.current = { blobRefId: blobRefId!, bitmap }
      setBitmapVersion((v) => v + 1)
    }

    void decode().finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [blobRefId, fileName, mimeType])

  // Draw: redraws from the cached bitmap on every edit/option change. A
  // layout effect so the canvas-target mode (fully synchronous — no I/O, no
  // encode) paints in the same commit as the decode finishing, instead of
  // flashing an empty canvas for a frame while a regular effect waits its turn.
  useLayoutEffect(() => {
    if (!asset) {
      latestParamsRef.current = null
      if (!targetCanvasRef) setUrl(null)
      return
    }

    latestParamsRef.current = { asset, maxDimension, ignoreCrop }
    pendingRef.current = true
    drawLatest()

    function drawLatest() {
      if (runningRef.current) return // a draw is already in flight — it'll pick up the latest params when it finishes
      const params = latestParamsRef.current
      const bitmap = bitmapRef.current?.bitmap
      if (!params || !bitmap) return

      runningRef.current = true
      pendingRef.current = false

      if (targetCanvasRef?.current) {
        renderEditedImage(bitmap, params.asset.edits, {
          maxDimension: params.maxDimension,
          ignoreCrop: params.ignoreCrop,
          targetCanvas: targetCanvasRef.current,
        })
        runningRef.current = false
        if (pendingRef.current) drawLatest()
        return
      }

      const canvas = renderEditedImage(bitmap, params.asset.edits, {
        maxDimension: params.maxDimension,
        ignoreCrop: params.ignoreCrop,
      })
      void canvasToBlob(canvas, 'image/png').then((renderedBlob) => {
        runningRef.current = false
        if (mountedRef.current) {
          if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
          const nextUrl = URL.createObjectURL(renderedBlob)
          objectUrlRef.current = nextUrl
          setUrl(nextUrl)
        }
        if (pendingRef.current) drawLatest()
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset, asset?.edits, maxDimension, ignoreCrop, bitmapVersion, targetCanvasRef])

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    },
    [],
  )

  return { url, loading }
}
