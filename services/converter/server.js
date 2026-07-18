const express = require('express')
const multer = require('multer')
const { execFile } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const crypto = require('node:crypto')

const app = express()

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024
const CONVERT_TIMEOUT_MS = 55_000

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
})

// LibreOffice's own conversion filter name for each output extension we support.
const TARGET_FILTERS = {
  pdf: 'pdf',
  docx: 'docx',
  pptx: 'pptx',
  xlsx: 'xlsx',
}

const OUTPUT_CONTENT_TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

const ACCEPTED_SOURCE_EXTENSIONS = new Set([
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'pdf',
  'odt',
  'odp',
  'ods',
])

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/convert', upload.single('file'), (req, res) => {
  const target = String(req.query.to || req.body?.to || '').toLowerCase()
  const file = req.file

  if (!file) {
    res.status(400).json({ error: 'Missing "file" in the request body.' })
    return
  }

  const cleanupUpload = () => fs.promises.unlink(file.path).catch(() => {})

  const sourceExtension = path.extname(file.originalname).replace('.', '').toLowerCase()
  if (!ACCEPTED_SOURCE_EXTENSIONS.has(sourceExtension)) {
    cleanupUpload()
    res.status(400).json({ error: `Unsupported source file type: .${sourceExtension}` })
    return
  }

  const filter = TARGET_FILTERS[target]
  if (!filter) {
    cleanupUpload()
    res.status(400).json({ error: `Unsupported target format: ${target}` })
    return
  }

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'doclee-convert-'))
  // Each invocation gets its own LibreOffice profile dir — running multiple
  // soffice processes against a shared profile causes lock/startup failures.
  const profileDir = path.join(workDir, 'lo-profile')
  const inputPath = path.join(workDir, `input.${sourceExtension}`)

  const cleanupWorkDir = () => fs.promises.rm(workDir, { recursive: true, force: true }).catch(() => {})

  fs.copyFile(file.path, inputPath, (copyError) => {
    cleanupUpload()
    if (copyError) {
      cleanupWorkDir()
      res.status(500).json({ error: 'Failed to stage the uploaded file.' })
      return
    }

    execFile(
      'soffice',
      [
        '--headless',
        '--norestore',
        `-env:UserInstallation=file://${profileDir}`,
        '--convert-to',
        filter,
        '--outdir',
        workDir,
        inputPath,
      ],
      { timeout: CONVERT_TIMEOUT_MS },
      (execError) => {
        if (execError) {
          cleanupWorkDir()
          res.status(500).json({ error: 'Conversion failed.', detail: execError.message })
          return
        }

        const outputPath = path.join(workDir, `input.${target}`)
        if (!fs.existsSync(outputPath)) {
          cleanupWorkDir()
          res.status(500).json({ error: 'Conversion completed but produced no output file.' })
          return
        }

        const downloadName = `${path.parse(file.originalname).name}-${crypto.randomUUID().slice(0, 8)}.${target}`
        res.setHeader('Content-Type', OUTPUT_CONTENT_TYPES[target])
        res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`)

        const stream = fs.createReadStream(outputPath)
        stream.pipe(res)
        stream.on('close', cleanupWorkDir)
        stream.on('error', () => {
          cleanupWorkDir()
          if (!res.headersSent) res.status(500).json({ error: 'Failed to stream the converted file.' })
        })
      },
    )
  })
})

// Multer errors (e.g. file too large) land here rather than in the route handler.
app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    res.status(400).json({ error: error.message })
    return
  }
  res.status(500).json({ error: 'Unexpected server error.' })
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Doclee converter listening on port ${port}`)
})
