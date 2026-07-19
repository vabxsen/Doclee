import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'

const LandingPage = lazy(() =>
  import('@/pages/landing/LandingPage').then((m) => ({ default: m.LandingPage })),
)
const ImageToPdfEditorPage = lazy(() =>
  import('@/pages/editor/ImageToPdfEditorPage').then((m) => ({ default: m.ImageToPdfEditorPage })),
)
const ComingSoonPage = lazy(() =>
  import('@/pages/tools/ComingSoonPage').then((m) => ({ default: m.ComingSoonPage })),
)
const SettingsPage = lazy(() =>
  import('@/pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const HistoryPage = lazy(() =>
  import('@/pages/history/HistoryPage').then((m) => ({ default: m.HistoryPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

const MergePdfPage = lazy(() =>
  import('@/pages/tools/functional/MergePdfPage').then((m) => ({ default: m.MergePdfPage })),
)
const SplitPdfPage = lazy(() =>
  import('@/pages/tools/functional/SplitPdfPage').then((m) => ({ default: m.SplitPdfPage })),
)
const RotatePdfPage = lazy(() =>
  import('@/pages/tools/functional/RotatePdfPage').then((m) => ({ default: m.RotatePdfPage })),
)
const DeletePagesPage = lazy(() =>
  import('@/pages/tools/functional/DeletePagesPage').then((m) => ({ default: m.DeletePagesPage })),
)
const ExtractPagesPage = lazy(() =>
  import('@/pages/tools/functional/ExtractPagesPage').then((m) => ({ default: m.ExtractPagesPage })),
)
const InsertBlankPagePage = lazy(() =>
  import('@/pages/tools/functional/InsertBlankPagePage').then((m) => ({
    default: m.InsertBlankPagePage,
  })),
)
const WatermarkPdfPage = lazy(() =>
  import('@/pages/tools/functional/WatermarkPdfPage').then((m) => ({ default: m.WatermarkPdfPage })),
)
const AddPageNumbersPage = lazy(() =>
  import('@/pages/tools/functional/AddPageNumbersPage').then((m) => ({
    default: m.AddPageNumbersPage,
  })),
)
const SignPdfPage = lazy(() =>
  import('@/pages/tools/functional/SignPdfPage').then((m) => ({ default: m.SignPdfPage })),
)
const PdfToJpgPage = lazy(() =>
  import('@/pages/tools/functional/PdfToJpgPage').then((m) => ({ default: m.PdfToJpgPage })),
)
const PdfToPngPage = lazy(() =>
  import('@/pages/tools/functional/PdfToPngPage').then((m) => ({ default: m.PdfToPngPage })),
)
const PdfToWebpPage = lazy(() =>
  import('@/pages/tools/functional/PdfToWebpPage').then((m) => ({ default: m.PdfToWebpPage })),
)
const CompressPdfPage = lazy(() =>
  import('@/pages/tools/functional/CompressPdfPage').then((m) => ({ default: m.CompressPdfPage })),
)
const DrawOnPdfPage = lazy(() =>
  import('@/pages/tools/functional/DrawOnPdfPage').then((m) => ({ default: m.DrawOnPdfPage })),
)
const HighlightPdfPage = lazy(() =>
  import('@/pages/tools/functional/HighlightPdfPage').then((m) => ({ default: m.HighlightPdfPage })),
)
const AnnotatePdfPage = lazy(() =>
  import('@/pages/tools/functional/AnnotatePdfPage').then((m) => ({ default: m.AnnotatePdfPage })),
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'tools/image-to-pdf', element: <ImageToPdfEditorPage /> },
      { path: 'tools/merge-pdf', element: <MergePdfPage /> },
      { path: 'tools/split-pdf', element: <SplitPdfPage /> },
      { path: 'tools/rotate-pdf', element: <RotatePdfPage /> },
      { path: 'tools/delete-pages', element: <DeletePagesPage /> },
      { path: 'tools/extract-pages', element: <ExtractPagesPage /> },
      { path: 'tools/insert-blank-page', element: <InsertBlankPagePage /> },
      { path: 'tools/watermark-pdf', element: <WatermarkPdfPage /> },
      { path: 'tools/add-page-numbers', element: <AddPageNumbersPage /> },
      { path: 'tools/sign-pdf', element: <SignPdfPage /> },
      { path: 'tools/pdf-to-jpg', element: <PdfToJpgPage /> },
      { path: 'tools/pdf-to-png', element: <PdfToPngPage /> },
      { path: 'tools/pdf-to-webp', element: <PdfToWebpPage /> },
      { path: 'tools/compress-pdf', element: <CompressPdfPage /> },
      { path: 'tools/draw-on-pdf', element: <DrawOnPdfPage /> },
      { path: 'tools/highlight-pdf', element: <HighlightPdfPage /> },
      { path: 'tools/annotate-pdf', element: <AnnotatePdfPage /> },
      { path: 'tools/:slug', element: <ComingSoonPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
