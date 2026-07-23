export type SniffedFormat = 'jpeg' | 'png' | 'gif' | 'bmp' | 'webp' | 'tiff' | 'heic' | 'svg' | 'unknown'

const HEIC_BRANDS = new Set(['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'hevm', 'hevs', 'mif1', 'msf1'])

/**
 * Identifies the real format from the file's magic bytes rather than trusting
 * its extension or MIME type — both are unreliable in practice (HEIC photos
 * routinely arrive renamed ".jpg" from messaging apps and cloud downloads,
 * and some browsers/OSes report an empty or generic `file.type`). Routing by
 * content instead of by name is what actually fixes "unsupported or
 * corrupted" errors on files that are really just mislabeled.
 */
export async function sniffImageFormat(file: File): Promise<SniffedFormat> {
  const head = new Uint8Array(await file.slice(0, 32).arrayBuffer())
  const ascii = (start: number, len: number) =>
    String.fromCharCode(...head.subarray(start, start + len))

  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'jpeg'
  if (head[0] === 0x89 && ascii(1, 3) === 'PNG') return 'png'
  if (ascii(0, 4) === 'GIF8') return 'gif'
  if (ascii(0, 2) === 'BM') return 'bmp'
  if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return 'webp'
  if (
    (head[0] === 0x49 && head[1] === 0x49 && head[2] === 0x2a && head[3] === 0x00) ||
    (head[0] === 0x4d && head[1] === 0x4d && head[2] === 0x00 && head[3] === 0x2a)
  ) {
    return 'tiff'
  }
  if (ascii(4, 4) === 'ftyp' && HEIC_BRANDS.has(ascii(8, 4))) return 'heic'

  const textHead = new TextDecoder().decode(head).trimStart()
  if (textHead.startsWith('<?xml') || textHead.startsWith('<svg')) return 'svg'

  return 'unknown'
}
