import { useDocumentStore } from '@/store/useDocumentStore'
import { EditorTopToolbar } from '@/components/editor/EditorTopToolbar'
import { ThumbnailRail } from '@/components/editor/ThumbnailRail'
import { CanvasPreview } from '@/components/editor/CanvasPreview'
import { SettingsPanel } from '@/components/editor/SettingsPanel'
import { ExportFAB } from '@/components/editor/ExportFAB'
import type { usePdfExport } from '@/hooks/usePdfExport'

interface ImageWorkspaceProps {
  exportState: ReturnType<typeof usePdfExport>
}

export function ImageWorkspace({ exportState }: ImageWorkspaceProps) {
  const imageCount = useDocumentStore((state) => state.images.length)

  return (
    <div className="flex h-[calc(100svh-8rem)] flex-col md:h-[calc(100svh-4rem)]">
      <EditorTopToolbar />
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <ThumbnailRail />
        <CanvasPreview />
        <SettingsPanel />
      </div>
      <ExportFAB exportState={exportState} disabled={imageCount === 0} />
    </div>
  )
}
