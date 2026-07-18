export type HistoryCommandType =
  | 'add-images'
  | 'remove-image'
  | 'duplicate-image'
  | 'reorder-images'
  | 'update-image-edits'
  | 'update-pdf-settings'

export interface HistoryCommand<T = unknown> {
  type: HistoryCommandType
  imageId?: string
  prevValue: T
  nextValue: T
  /**
   * Applies prevValue/nextValue back onto the store; set by the store when
   * the command is recorded. Declared as a method (not an arrow-typed
   * property) so TS's bivariant method-parameter checking lets commands of
   * different concrete T live together in one HistoryCommand[] stack — safe
   * in practice since a command's apply is only ever called with its own T.
   */
  apply(value: T): void
}
