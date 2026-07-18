import { FileQuestion } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { EmptyState } from '@/components/ui/EmptyState'
import { LinkButton } from '@/components/ui/LinkButton'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-[1400px] items-center justify-center px-4 py-24 sm:px-6 lg:px-10">
      <SEO title="Page not found" />
      <EmptyState
        icon={<FileQuestion className="size-6" />}
        title="This page doesn't exist"
        description="The page you're looking for may have moved or never existed."
        action={<LinkButton to="/">Back to Doclee</LinkButton>}
      />
    </div>
  )
}
