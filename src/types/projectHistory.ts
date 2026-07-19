/**
 * A lightweight log entry for a past export — metadata and a small
 * thumbnail only. The original images/PDF are never uploaded; this exists
 * purely so a signed-in user can see what they've made across devices.
 */
export interface ProjectHistoryEntry {
  id: string
  fileName: string
  pageCount: number
  thumbnailDataUrl: string
  createdAt: number
}
