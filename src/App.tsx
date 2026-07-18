import { RouterProvider } from 'react-router-dom'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { useAuthListener } from '@/hooks/useAuthListener'
import { router } from '@/routes/router'

function App() {
  useAuthListener()

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}

export default App
