import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { pageVariants } from '@/lib/motion'

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[calc(100svh-4rem)]"
    >
      {children}
    </motion.main>
  )
}
