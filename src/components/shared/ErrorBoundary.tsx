import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Doclee crashed:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-base px-6 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-error/15 text-error">
            <AlertTriangle className="size-6" />
          </span>
          <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
          <p className="max-w-sm text-sm text-ink-muted">
            Doclee hit an unexpected error. Your images and edits are autosaved, so reloading is safe.
          </p>
          <Button onClick={() => window.location.reload()}>Reload Doclee</Button>
        </div>
      )
    }
    return this.props.children
  }
}
