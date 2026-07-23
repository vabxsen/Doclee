<div align="center">

<img src="public/logo.png" alt="Doclee logo" width="96" height="96">

# Doclee

**A premium, privacy-first PDF toolkit — built as an installable Progressive Web App.**

Convert, edit, and organize documents entirely in your browser. Nothing is uploaded unless you say so.

[![Live Site](https://img.shields.io/badge/live-doclee.web.app-black?style=flat-square)](https://doclee.web.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

**🌐 Live App → [https://doclee.web.app/](https://doclee.web.app/)** · **[🐛 Report a bug](../../issues)**

</div>

---

## ✨ What is Doclee?

Doclee is a PDF toolkit that runs almost entirely on your device. Images are decoded, edited, and assembled into a PDF right in the browser via Canvas and `pdf-lib` — no server, no upload, no account required. Install it as a PWA and it keeps working offline.

## 🧰 Features

### 🖼️ Image → PDF (the flagship tool)
Fully built, pixel-perfect, lossless by default:
- Multi-image upload — PNG, JPG, WEBP, BMP, GIF, TIFF, HEIC, SVG
- Drag-to-reorder, crop, rotate, flip
- Live brightness / contrast / saturation / hue / exposure / sharpen / blur adjustments, plus one-tap presets (grayscale, B&W, sepia, vivid, invert)
- Undo/redo and autosave
- Full export controls — page size, orientation, margins, background, fit, alignment, compression, DPI, watermark, page numbers, metadata
- Share or download the finished PDF straight from a live preview

### 📄 PDF tools
| Tool | What it does |
|---|---|
| 🔗 **Merge PDF** | Combine multiple PDFs into one, with drag-to-reorder |
| ✂️ **Split PDF** | Break a PDF into standalone files by page range |
| 🔄 **Rotate PDF** | Rotate individual pages or the whole document |
| 🗑️ **Delete Pages** | Remove unwanted pages |
| 📤 **Extract Pages** | Pull specific pages into a new PDF |
| ➕ **Insert Blank Page** | Add a blank page anywhere |
| 💧 **Watermark PDF** | Stamp text across every page |
| 🔢 **Add Page Numbers** | Number pages automatically |
| ✍️ **Sign PDF** | Draw and place a signature |
| 🖌️ **Markup PDF** | Draw, highlight, and add sticky notes |
| 🗜️ **Compress PDF** | Shrink file size while keeping pages sharp |
| 🖼️ **PDF → Image** | Export every page as JPG, PNG, or WEBP |
| 🔒 **Lock PDF** / 🔓 **Unlock PDF** | Password-protect or remove a password — fully client-side encryption |
| 📷 **Document Scanner** | Capture a page with your camera, correct perspective, and export as PDF |

### 🚧 Coming soon
- **Word / PPT / Excel ⇄ PDF** — conversion service is built, pending a Cloud Run deploy
- **OCR**, **AI Enhance**, **Background Removal** — not yet started

### 🔐 Privacy & accounts
- Optional Google sign-in — identity and a synced history of file names/thumbnails only, never your documents
- Everything else works fully signed-out, forever

### 📲 Installable PWA
Works offline, installs on desktop and mobile, with a bottom tab bar on phones and automatic background updates.

## 🏗️ Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · Zustand · pdf-lib · pdf.js · Firebase (Hosting / Auth / Firestore) · react-dropzone · dnd-kit

Everything client-side: images are decoded, edited, and assembled into a PDF entirely in the browser via Canvas/pdf-lib, with originals cached in IndexedDB and settings in localStorage.

## 🚀 Getting started

```bash
git clone https://github.com/vabxsen/Doclee.git
cd Doclee
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in your own Firebase project's web config to enable Auth/history locally (the app runs fine without it — those features just no-op).

```bash
npm run build      # production build
npm run preview    # serve the production build locally
npm run typecheck  # tsc -b
npm run lint       # oxlint
```

## 🗂️ Office format conversions

Word/PPT/Excel ⇄ PDF run on a separate headless-LibreOffice service in [`services/converter`](services/converter) (Express + Docker), deployed to Cloud Run and reached via a Firebase Hosting rewrite of `/api/convert`. See that folder's `Dockerfile` for the deploy command.

## ☁️ Deploying

```bash
npm run build
firebase deploy --only hosting:doclee
```

This project's Firebase Hosting has two sites — deploys must target `doclee` explicitly (see `firebase.json`).

## 🤝 Contributing

Issues and pull requests are welcome — feel free to open one for a bug, idea, or improvement.

## 📄 License

[MIT](LICENSE) © Vaibhav Sen

---

<div align="center">

Made with ❤️ by **[Vaibhav Sen](https://github.com/vabxsen)**

</div>
