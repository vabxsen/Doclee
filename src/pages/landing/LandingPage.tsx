import { SEO } from '@/components/shared/SEO'
import { BottomNavSpacer } from '@/components/layout/BottomNavSpacer'
import { HeroSection } from '@/pages/landing/HeroSection'
import { RecentProjectsSection } from '@/pages/landing/RecentProjectsSection'
import { FeatureShowcase } from '@/pages/landing/FeatureShowcase'
import { HowItWorksSection } from '@/pages/landing/HowItWorksSection'
import { ToolsGridSection } from '@/pages/landing/ToolsGridSection'
import { FAQSection } from '@/pages/landing/FAQSection'
import { CTASection } from '@/pages/landing/CTASection'
import { LandingFooter } from '@/pages/landing/LandingFooter'

export function LandingPage() {
  return (
    <>
      <SEO
        title="Doclee"
        description="Doclee converts images into pixel-perfect, lossless PDFs. No account, works offline, installable app."
      />
      <HeroSection />
      <RecentProjectsSection />
      <FeatureShowcase />
      <HowItWorksSection />
      <ToolsGridSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
      <BottomNavSpacer />
    </>
  )
}
