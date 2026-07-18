// Regenerates public/icons/* and the favicon/apple-touch-icon from the two
// source SVGs at the repo root. Run with `node scripts/generate-icons.mjs`
// whenever icon-source.svg / icon-maskable-source.svg change.
import sharp from 'sharp'
import { mkdir, copyFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const iconsDir = path.join(rootDir, 'public', 'icons')

const REGULAR_SIZES = [48, 72, 96, 128, 144, 152, 192, 384, 512]
const MASKABLE_SIZES = [192, 512]

async function main() {
  await mkdir(iconsDir, { recursive: true })

  const sourceSvg = path.join(rootDir, 'icon-source.svg')
  const maskableSvg = path.join(rootDir, 'icon-maskable-source.svg')

  await Promise.all(
    REGULAR_SIZES.map((size) =>
      sharp(sourceSvg)
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `icon-${size}.png`)),
    ),
  )

  await Promise.all(
    MASKABLE_SIZES.map((size) =>
      sharp(maskableSvg)
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `maskable-${size}.png`)),
    ),
  )

  await sharp(sourceSvg).resize(180, 180).png().toFile(path.join(rootDir, 'public', 'apple-touch-icon.png'))
  await copyFile(sourceSvg, path.join(rootDir, 'public', 'favicon.svg'))

  console.log(`Generated ${REGULAR_SIZES.length + MASKABLE_SIZES.length + 1} icons.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
