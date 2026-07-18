# Doclee

A premium, privacy-first PDF toolkit built as a Progressive Web App. Convert images to high-quality PDFs, edit and organize documents, and work entirely in your browser with no uploads required.

Live at **[doclee.web.app](https://doclee.web.app)**.

## What's here

- **Image → PDF** — fully built: multi-image upload (PNG/JPG/WEBP/BMP/GIF/TIFF/HEIC/SVG), drag-to-reorder, crop/rotate/flip, brightness/contrast/saturation/hue/exposure/sharpen/blur adjustments, undo/redo, autosave, and a full PDF export settings panel (page size, orientation, margins, background, fit, alignment, compression, DPI, watermark, page numbers, metadata) — lossless by default.
- **Every other PDF tool** (merge, split, sign, annotate, lock, Office ⇄ PDF conversions, scanners) — styled, routed, and ready, currently in a "Coming Soon" state.
- **Optional Google sign-in** — identity only for now; documents stay local either way.
- **Installable PWA** — works offline, installs on desktop and mobile, with a bottom tab bar on phones.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · Zustand · pdf-lib · Firebase (Hosting/Auth/Firestore/Storage) · react-dropzone · dnd-kit

Everything runs client-side — images are decoded, edited, and assembled into a PDF entirely in the browser via Canvas/pdf-lib, with originals cached in IndexedDB and small settings in localStorage. Nothing is uploaded unless you explicitly export or share it.

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in your own Firebase project's web config to enable Auth/Analytics locally (the app runs fine without it — those features just no-op).

```bash
npm run build     # production build
npm run preview   # serve the production build locally
npm run typecheck # tsc -b
npm run lint      # oxlint
```

## Office format conversions

Word/PPT/Excel ⇄ PDF run on a separate headless-LibreOffice service in [`services/converter`](services/converter) (Express + Docker), deployed to Cloud Run and reached via a Firebase Hosting rewrite of `/api/convert`. See that folder's `Dockerfile` for the deploy command.

## Deploying

```bash
npm run build
firebase deploy --only hosting:doclee
```

This project's Firebase Hosting has two sites — deploys must target `doclee` explicitly (see `firebase.json`).
