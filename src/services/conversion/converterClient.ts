/**
 * Client for the standalone LibreOffice-based conversion service (see
 * services/converter at the repo root — a Cloud Run container, not a
 * Firebase Function). Reached via the same-origin `/api/convert` Firebase
 * Hosting rewrite, so no separate CORS setup or client SDK is needed.
 */

const SLUG_TO_TARGET_FORMAT: Partial<Record<string, string>> = {
  'word-to-pdf': 'pdf',
  'ppt-to-pdf': 'pdf',
  'excel-to-pdf': 'pdf',
  'pdf-to-word': 'docx',
  'pdf-to-ppt': 'pptx',
  'pdf-to-excel': 'xlsx',
}

export function getConversionTargetForSlug(slug: string): string | null {
  return SLUG_TO_TARGET_FORMAT[slug] ?? null
}

/** react-dropzone `accept` config for the source format each direction expects. */
const SLUG_TO_SOURCE_ACCEPT: Partial<Record<string, Record<string, string[]>>> = {
  'word-to-pdf': { 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
  'ppt-to-pdf': { 'application/vnd.ms-powerpoint': ['.ppt'], 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] },
  'excel-to-pdf': { 'application/vnd.ms-excel': ['.xls'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
  'pdf-to-word': { 'application/pdf': ['.pdf'] },
  'pdf-to-ppt': { 'application/pdf': ['.pdf'] },
  'pdf-to-excel': { 'application/pdf': ['.pdf'] },
}

export function getSourceAcceptForSlug(slug: string): Record<string, string[]> | undefined {
  return SLUG_TO_SOURCE_ACCEPT[slug]
}

export interface ConversionResult {
  ok: boolean
  message: string
  blob?: Blob
  fileName?: string
}

function extractFileName(contentDisposition: string | null, fallback: string): string {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/)
  return match?.[1] ?? fallback
}

export async function convertFile(slug: string, file: File): Promise<ConversionResult> {
  const target = getConversionTargetForSlug(slug)
  if (!target) {
    return { ok: false, message: "This conversion isn't wired up yet." }
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(`/api/convert?to=${target}`, { method: 'POST', body: formData })

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null
      return {
        ok: false,
        message:
          body?.error ??
          `Conversion failed (${response.status}). The converter service may not be deployed yet.`,
      }
    }

    const blob = await response.blob()
    const fileName = extractFileName(response.headers.get('Content-Disposition'), `converted.${target}`)
    return { ok: true, message: 'Conversion complete — downloading now.', blob, fileName }
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Unknown error'
    return { ok: false, message: `Couldn't reach the converter service: ${description}` }
  }
}
