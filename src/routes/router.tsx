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
const PdfToImagePage = lazy(() =>
  import('@/pages/tools/functional/PdfToImagePage').then((m) => ({ default: m.PdfToImagePage })),
)
const CompressPdfPage = lazy(() =>
  import('@/pages/tools/functional/CompressPdfPage').then((m) => ({ default: m.CompressPdfPage })),
)
const PdfMarkupPage = lazy(() =>
  import('@/pages/tools/functional/PdfMarkupPage').then((m) => ({ default: m.PdfMarkupPage })),
)
const LockPdfPage = lazy(() =>
  import('@/pages/tools/functional/LockPdfPage').then((m) => ({ default: m.LockPdfPage })),
)
const UnlockPdfPage = lazy(() =>
  import('@/pages/tools/functional/UnlockPdfPage').then((m) => ({ default: m.UnlockPdfPage })),
)
const DocumentScannerPage = lazy(() =>
  import('@/pages/tools/functional/DocumentScannerPage').then((m) => ({
    default: m.DocumentScannerPage,
  })),
)
const ConversionToolPage = lazy(() =>
  import('@/pages/tools/functional/ConversionToolPage').then((m) => ({
    default: m.ConversionToolPage,
  })),
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
      { path: 'tools/pdf-to-image', element: <PdfToImagePage /> },
      { path: 'tools/compress-pdf', element: <CompressPdfPage /> },
      { path: 'tools/markup-pdf', element: <PdfMarkupPage /> },
      { path: 'tools/lock-pdf', element: <LockPdfPage /> },
      { path: 'tools/unlock-pdf', element: <UnlockPdfPage /> },
      { path: 'tools/document-scanner', element: <DocumentScannerPage /> },
      {
        path: 'tools/word-to-pdf',
        element: <ConversionToolPage slug="word-to-pdf" sourceLabel="DOCX" />,
      },
      {
        path: 'tools/pdf-to-word',
        element: <ConversionToolPage slug="pdf-to-word" sourceLabel="PDF" />,
      },
      {
        path: 'tools/ppt-to-pdf',
        element: <ConversionToolPage slug="ppt-to-pdf" sourceLabel="PPTX" />,
      },
      {
        path: 'tools/excel-to-pdf',
        element: <ConversionToolPage slug="excel-to-pdf" sourceLabel="XLSX" />,
      },
      { path: 'tools/:slug', element: <ComingSoonPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
