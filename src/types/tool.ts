import type { LucideIcon } from 'lucide-react'

export type ToolCategory =
  | 'convert'
  | 'organize'
  | 'edit'
  | 'security'
  | 'scan'
  | 'ai'

export type ToolStatus = 'live' | 'coming-soon'

export type ToolBackendNeed = 'client' | 'moderate' | 'library' | 'backend' | 'undecided'

export interface ToolDefinition {
  slug: string
  title: string
  shortTitle?: string
  description: string
  icon: LucideIcon
  category: ToolCategory
  status: ToolStatus
  backendNeed: ToolBackendNeed
  /** Shown on the Coming Soon page to set expectations honestly. */
  followUpNote?: string
}
