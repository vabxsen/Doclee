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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'tools/image-to-pdf', element: <ImageToPdfEditorPage /> },
      { path: 'tools/:slug', element: <ComingSoonPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
