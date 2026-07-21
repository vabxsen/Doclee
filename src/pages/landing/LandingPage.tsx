import { SEO } from '@/components/shared/SEO'
import { BottomNavSpacer } from '@/components/layout/BottomNavSpacer'
import { HeroSection } from '@/pages/landing/HeroSection'
import { ToolsGridSection } from '@/pages/landing/ToolsGridSection'
import { FAQSection } from '@/pages/landing/FAQSection'
import { LandingFooter } from '@/pages/landing/LandingFooter'

export function LandingPage() {
  return (
    <>
      <SEO
        title="Doclee"
        description="Doclee converts images into pixel-perfect, lossless PDFs. No account, works offline, installable app."
      />
      <HeroSection />
      <ToolsGridSection />
      <FAQSection />
      <LandingFooter />
      <BottomNavSpacer />
    </>
  )
}
