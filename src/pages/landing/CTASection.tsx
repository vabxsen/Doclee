import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { LinkButton } from '@/components/ui/LinkButton'
import { fadeInUp } from '@/lib/motion'

export function CTASection() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-24 pt-4 sm:px-6 lg:px-10">
      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-80px' }}
        className="glass-strong flex flex-col items-center gap-5 rounded-dialog px-8 py-14 text-center"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Ready for a better PDF workflow?
        </h2>
        <p className="max-w-md text-sm text-ink-muted">
          No sign-up, no upload, no compromise on quality. Just drop your images in.
        </p>
        <LinkButton to="/tools/image-to-pdf" size="lg" trailingIcon={<ArrowRight className="size-4" />}>
          Start converting
        </LinkButton>
      </motion.div>
    </section>
  )
}
