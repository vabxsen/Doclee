/** Parses "1-3, 5, 8-10" into 0-indexed page-index arrays, one per comma-separated group. */
export function parsePageRangeGroups(input: string, totalPages: number): number[][] | null {
  const groups = input
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (groups.length === 0) return null

  const result: number[][] = []
  for (const group of groups) {
    const rangeMatch = group.match(/^(\d+)\s*-\s*(\d+)$/)
    const singleMatch = group.match(/^(\d+)$/)
    if (rangeMatch) {
      const start = Number(rangeMatch[1])
      const end = Number(rangeMatch[2])
      if (start < 1 || end > totalPages || start > end) return null
      result.push(Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i))
    } else if (singleMatch) {
      const page = Number(singleMatch[1])
      if (page < 1 || page > totalPages) return null
      result.push([page - 1])
    } else {
      return null
    }
  }
  return result
}

/** Parses "1-3, 5, 8-10" into a single flat, de-duplicated, sorted 0-indexed page-index array. */
export function parsePageRangeFlat(input: string, totalPages: number): number[] | null {
  const groups = parsePageRangeGroups(input, totalPages)
  if (!groups) return null
  const set = new Set(groups.flat())
  return Array.from(set).sort((a, b) => a - b)
}
