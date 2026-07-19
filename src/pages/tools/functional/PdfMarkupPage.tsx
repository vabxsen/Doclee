import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { toast } from 'sonner'
import { Eraser, X } from 'lucide-react'
import { ToolPageHeader } from '@/components/tools/ToolPageHeader'
import { ToolPageLayout } from '@/components/tools/ToolPageLayout'
import { PdfDropzone } from '@/components/tools/PdfDropzone'
import { ResultCard } from '@/components/tools/ResultCard'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Select } from '@/components/ui/Select'
import { useLoadedPdf } from '@/hooks/useLoadedPdf'
import { renderPdfPageToDataUrl, baseFileName } from '@/services/pdf/pdfFileIO'
import { downloadBlob } from '@/utils/download'
import { getToolBySlug } from '@/pages/tools/toolsRegistry'
import type { ToolDefinition } from '@/types/tool'

type MarkupMode = 'draw' | 'highlight' | 'annotate'

interface Point {
  x: number
  y: number
}

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

interface Note extends Point {
  id: string
  text: string
}

const PREVIEW_WIDTH = 520

const MODE_COPY: Record<MarkupMode, { instructions: string; suffix: string; empty: string }> = {
  draw: {
    instructions: 'Drag to sketch directly on the page.',
    suffix: 'drawn',
    empty: 'Draw something before applying.',
  },
  highlight: {
    instructions: 'Drag to draw a highlight over the passage that matters.',
    suffix: 'highlighted',
    empty: 'Draw a highlight before applying.',
  },
  annotate: {
    instructions: 'Click anywhere on the page, then type a short note.',
    suffix: 'annotated',
    empty: 'Add a note before applying.',
  },
}

export function PdfMarkupPage({ mode, toolSlug }: { mode: MarkupMode; toolSlug: string }) {
  const tool = getToolBySlug(toolSlug) as ToolDefinition
  const [file, setFile] = useState<File | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)
  const [bgSize, setBgSize] = useState({ width: PREVIEW_WIDTH, height: PREVIEW_WIDTH })
  const [scale, setScale] = useState(1)
  const [strokes, setStrokes] = useState<Point[][]>([])
  const [rects, setRects] = useState<Rect[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [pendingNote, setPendingNote] = useState<Point | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [processing, setProcessing] = useState(false)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const currentStrokeRef = useRef<Point[]>([])
  const dragStartRef = useRef<Point | null>(null)
  const currentRectRef = useRef<Rect | null>(null)

  const { doc, pageCount } = useLoadedPdf(file)
  const copy = MODE_COPY[mode]

  useEffect(() => {
    setStrokes([])
    setRects([])
    setNotes([])
    setPendingNote(null)
  }, [pageIndex, file])

  useEffect(() => {
    if (!doc) return
    let cancelled = false
    doc.getPage(pageIndex + 1).then((page) => {
      if (cancelled) return
      const native = page.getViewport({ scale: 1 })
      const nextScale = PREVIEW_WIDTH / native.width
      setScale(nextScale)
      setBgSize({ width: Math.round(native.width * nextScale), height: Math.round(native.height * nextScale) })
      renderPdfPageToDataUrl(doc, pageIndex + 1, nextScale).then((url) => {
        if (!cancelled) setBackgroundUrl(url)
      })
    })
    return () => {
      cancelled = true
    }
  }, [doc, pageIndex])

  const redraw = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (mode === 'draw') {
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#ff5a5f'
      for (const stroke of strokes) {
        if (stroke.length < 2) continue
        ctx.beginPath()
        ctx.moveTo(stroke[0]!.x, stroke[0]!.y)
        for (const point of stroke.slice(1)) ctx.lineTo(point.x, point.y)
        ctx.stroke()
      }
    }

    if (mode === 'highlight') {
      ctx.fillStyle = 'rgba(255, 224, 32, 0.4)'
      for (const rect of rects) ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
    }
  }

  useEffect(redraw, [strokes, rects, mode])

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getPoint(event)
    event.currentTarget.setPointerCapture(event.pointerId)

    if (mode === 'draw') {
      drawingRef.current = true
      currentStrokeRef.current = [point]
    } else if (mode === 'highlight') {
      drawingRef.current = true
      dragStartRef.current = point
      currentRectRef.current = { x: point.x, y: point.y, w: 0, h: 0 }
    } else if (mode === 'annotate') {
      setPendingNote(point)
      setNoteDraft('')
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const point = getPoint(event)

    if (mode === 'draw') {
      currentStrokeRef.current = [...currentStrokeRef.current, point]
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (ctx) {
        redraw()
        const stroke = currentStrokeRef.current
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.strokeStyle = '#ff5a5f'
        ctx.beginPath()
        ctx.moveTo(stroke[0]!.x, stroke[0]!.y)
        for (const p of stroke.slice(1)) ctx.lineTo(p.x, p.y)
        ctx.stroke()
      }
    } else if (mode === 'highlight' && dragStartRef.current) {
      const start = dragStartRef.current
      const rect: Rect = {
        x: Math.min(start.x, point.x),
        y: Math.min(start.y, point.y),
        w: Math.abs(point.x - start.x),
        h: Math.abs(point.y - start.y),
      }
      currentRectRef.current = rect
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (ctx) {
        redraw()
        ctx.fillStyle = 'rgba(255, 224, 32, 0.4)'
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
      }
    }
  }

  const handlePointerUp = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    const finishedStroke = currentStrokeRef.current
    const finishedRect = currentRectRef.current
    if (mode === 'draw' && finishedStroke.length > 1) {
      setStrokes((prev) => [...prev, finishedStroke])
    }
    if (mode === 'highlight' && finishedRect && finishedRect.w > 4 && finishedRect.h > 4) {
      setRects((prev) => [...prev, finishedRect])
    }
    currentStrokeRef.current = []
    currentRectRef.current = null
    dragStartRef.current = null
  }

  const commitNote = () => {
    if (pendingNote && noteDraft.trim()) {
      setNotes((prev) => [...prev, { ...pendingNote, id: crypto.randomUUID(), text: noteDraft.trim() }])
    }
    setPendingNote(null)
    setNoteDraft('')
  }

  const clearMarkup = () => {
    setStrokes([])
    setRects([])
    setNotes([])
    setPendingNote(null)
  }

  const hasMarkup = strokes.length > 0 || rects.length > 0 || notes.length > 0

  const handleApply = async () => {
    if (!file || !hasMarkup) return
    setProcessing(true)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const page = pdf.getPage(pageIndex)
      const pageHeight = page.getSize().height
      const toPdfPoint = (p: Point): Point => ({ x: p.x / scale, y: pageHeight - p.y / scale })

      if (mode === 'draw') {
        for (const stroke of strokes) {
          for (let i = 0; i < stroke.length - 1; i++) {
            const start = toPdfPoint(stroke[i]!)
            const end = toPdfPoint(stroke[i + 1]!)
            page.drawLine({ start, end, thickness: 2.5 / scale, color: rgb(0.87, 0.22, 0.22) })
          }
        }
      }

      if (mode === 'highlight') {
        for (const rect of rects) {
          const bottomLeft = toPdfPoint({ x: rect.x, y: rect.y + rect.h })
          page.drawRectangle({
            x: bottomLeft.x,
            y: bottomLeft.y,
            width: rect.w / scale,
            height: rect.h / scale,
            color: rgb(1, 0.88, 0.13),
            opacity: 0.4,
          })
        }
      }

      if (mode === 'annotate') {
        const font = await pdf.embedFont(StandardFonts.Helvetica)
        for (const note of notes) {
          const anchor = toPdfPoint(note)
          const textWidth = font.widthOfTextAtSize(note.text, 9)
          page.drawRectangle({
            x: anchor.x + 6,
            y: anchor.y - 12,
            width: textWidth + 10,
            height: 16,
            color: rgb(1, 0.85, 0.3),
            opacity: 0.95,
          })
          page.drawEllipse({ x: anchor.x, y: anchor.y, xScale: 4, yScale: 4, color: rgb(0.95, 0.6, 0.1) })
          page.drawText(note.text, {
            x: anchor.x + 11,
            y: anchor.y - 9,
            size: 9,
            font,
            color: rgb(0, 0, 0),
          })
        }
      }

      const outBytes = await pdf.save()
      setResultBlob(new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' }))
      toast.success(`Page ${copy.suffix}`)
    } catch {
      toast.error("Couldn't edit that PDF")
    } finally {
      setProcessing(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPageIndex(0)
    setBackgroundUrl(null)
    clearMarkup()
    setResultBlob(null)
  }

  return (
    <ToolPageLayout>
      <ToolPageHeader icon={tool.icon} title={tool.title} description={tool.description} />

      {resultBlob ? (
        <ResultCard
          title="Changes applied"
          description={`Page ${pageIndex + 1} has been ${copy.suffix}.`}
          onDownload={() => downloadBlob(resultBlob, `${baseFileName(file!.name)}-edited.pdf`)}
          onReset={reset}
        />
      ) : !file ? (
        <PdfDropzone onFilesAccepted={(files) => setFile(files[0]!)} />
      ) : (
        <>
          {pageCount > 1 && (
            <div className="mx-auto w-full max-w-xs">
              <Select
                label="Page"
                value={pageIndex}
                onChange={(event) => setPageIndex(Number(event.target.value))}
                options={Array.from({ length: pageCount }, (_, i) => ({
                  value: String(i),
                  label: `Page ${i + 1}`,
                }))}
              />
            </div>
          )}

          <p className="text-center text-xs text-ink-muted">{copy.instructions}</p>

          {backgroundUrl && (
            <GlassCard className="relative mx-auto w-fit select-none p-2">
              <div className="relative">
                <img src={backgroundUrl} alt={`Page ${pageIndex + 1}`} className="block rounded-[10px]" />
                <canvas
                  ref={canvasRef}
                  width={bgSize.width}
                  height={bgSize.height}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  className="absolute inset-0 size-full touch-none"
                />
                {notes.map((note) => (
                  <span
                    key={note.id}
                    style={{ left: note.x, top: note.y }}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                  >
                    <span className="flex size-4 items-center justify-center rounded-full bg-amber-400 ring-2 ring-black/40" />
                    <button
                      type="button"
                      onClick={() => setNotes((prev) => prev.filter((n) => n.id !== note.id))}
                      className="absolute -right-1 -top-1 hidden size-3.5 items-center justify-center rounded-full bg-black/70 text-ink group-hover:flex"
                    >
                      <X className="size-2.5" />
                    </button>
                  </span>
                ))}
                {pendingNote && (
                  <div
                    style={{ left: pendingNote.x, top: pendingNote.y }}
                    className="glass-strong absolute z-10 flex -translate-y-full gap-1.5 rounded-[10px] p-1.5"
                  >
                    <input
                      autoFocus
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && commitNote()}
                      placeholder="Add a note…"
                      className="focus-ring h-8 w-40 rounded-[8px] bg-white/10 px-2 text-xs text-ink placeholder:text-ink-muted/60"
                    />
                    <Button size="sm" onClick={commitNote}>
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          <div className="flex justify-center gap-3">
            <Button
              variant="secondary"
              leadingIcon={<Eraser className="size-3.5" />}
              disabled={!hasMarkup}
              onClick={clearMarkup}
            >
              Clear
            </Button>
            <Button disabled={!hasMarkup} loading={processing} onClick={() => void handleApply()}>
              Apply
            </Button>
          </div>
          {!hasMarkup && <p className="text-center text-xs text-ink-muted/70">{copy.empty}</p>}
        </>
      )}
    </ToolPageLayout>
  )
}
