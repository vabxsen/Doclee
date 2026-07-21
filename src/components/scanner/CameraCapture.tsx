import { useEffect, useRef, useState } from 'react'
import { Aperture, Camera, ImageUp } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { decodeImageFile } from '@/services/imageDecoding/decodeImageFile'

interface CameraCaptureProps {
  onCapture: (canvas: HTMLCanvasElement) => void
}

function bitmapToCanvas(bitmap: ImageBitmap): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.drawImage(bitmap, 0, 0)
  return canvas
}

/** Live camera preview with a capture button, falling back to a photo upload when the camera is unavailable or denied. */
export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraFailed, setCameraFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraFailed(true)
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1920 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setCameraReady(true)
      } catch {
        if (!cancelled) setCameraFailed(true)
      }
    }

    void startCamera()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const handleCapture = () => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    onCapture(canvas)
  }

  const handleFileChosen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const { bitmap } = await decodeImageFile(file)
      onCapture(bitmapToCanvas(bitmap))
    } catch {
      toast.error("Couldn't read that photo")
    }
  }

  return (
    <GlassCard className="flex flex-col items-center gap-4 p-5">
      {/* Preview height is capped so it plus the buttons below always fit one mobile viewport without scrolling. */}
      {!cameraFailed && (
        <div
          className="relative mx-auto max-w-full overflow-hidden rounded-[14px] bg-black/40"
          style={{ height: '45dvh', aspectRatio: '3 / 4' }}
        >
          <video ref={videoRef} playsInline muted className="size-full object-cover" />
          {!cameraReady && (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-ink-muted">
              Starting camera…
            </p>
          )}
        </div>
      )}

      {cameraFailed && (
        <p className="text-center text-sm text-ink-muted">
          Live preview unavailable — take a photo or pick one from your gallery instead.
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {cameraReady && (
          <Button size="sm" leadingIcon={<Camera className="size-3.5" />} onClick={handleCapture}>
            Capture
          </Button>
        )}
        {/* Opens the phone's native camera app — full sensor resolution and HDR, far better than a live-stream frame. */}
        <Button
          size="sm"
          variant={cameraReady ? 'secondary' : 'primary'}
          leadingIcon={<Aperture className="size-3.5" />}
          onClick={() => cameraInputRef.current?.click()}
        >
          Take photo
        </Button>
        <Button
          size="sm"
          variant="secondary"
          leadingIcon={<ImageUp className="size-3.5" />}
          onClick={() => galleryInputRef.current?.click()}
        >
          Choose from gallery
        </Button>
      </div>

      {/* `capture` forces the OS camera; the gallery input omits it so phones show the photo picker. */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => void handleFileChosen(event)}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleFileChosen(event)}
      />
    </GlassCard>
  )
}
