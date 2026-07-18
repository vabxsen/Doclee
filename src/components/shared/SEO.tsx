import { useEffect } from 'react'
import { APP_NAME } from '@/lib/constants'

interface SEOProps {
  title: string
  description?: string
}

export function SEO({ title, description }: SEOProps) {
  useEffect(() => {
    document.title = title === APP_NAME ? title : `${title} — ${APP_NAME}`
    if (!description) return
    let tag = document.querySelector('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'description')
      document.head.appendChild(tag)
    }
    const previous = tag.getAttribute('content')
    tag.setAttribute('content', description)
    return () => {
      if (previous) tag?.setAttribute('content', previous)
    }
  }, [title, description])

  return null
}
