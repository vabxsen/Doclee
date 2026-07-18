import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { snapTransition } from '@/lib/motion'

const FAQS = [
  {
    question: 'Do I need to create an account?',
    answer: 'No. Doclee works entirely without sign-up — open it and start converting immediately.',
  },
  {
    question: 'Are my images uploaded to a server?',
    answer:
      'No. Image decoding, editing, and PDF generation all happen locally in your browser. Nothing leaves your device unless you explicitly export or share it yourself.',
  },
  {
    question: 'Does compression reduce quality?',
    answer:
      'Compression is off by default — Doclee embeds images losslessly. You can opt into JPEG compression levels if you want smaller files.',
  },
  {
    question: 'Does Doclee work offline?',
    answer:
      'Yes. Doclee is an installable PWA — once loaded, it keeps working without an internet connection.',
  },
  {
    question: 'What image formats are supported?',
    answer: 'PNG, JPG, JPEG, WEBP, BMP, GIF, TIFF, HEIC, and SVG.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Frequently asked questions
      </h2>
      <div className="flex flex-col gap-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <GlassCard key={faq.question} className="overflow-hidden p-0">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="focus-ring flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-medium text-ink">{faq.question}</span>
                <ChevronDown
                  className={`size-4 shrink-0 text-ink-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={snapTransition}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-ink-muted">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          )
        })}
      </div>
    </section>
  )
}
