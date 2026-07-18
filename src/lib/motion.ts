import type { Transition, Variants } from 'framer-motion'

export const glideTransition: Transition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1],
}

export const snapTransition: Transition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1],
}

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: glideTransition },
  exit: { opacity: 0, y: -8, transition: { ...snapTransition, duration: 0.15 } },
}

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: glideTransition },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: glideTransition },
  exit: { opacity: 0, scale: 0.98, transition: snapTransition },
}

export const staggerContainer = (stagger = 0.06): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: stagger,
    },
  },
})

export const listItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: glideTransition },
  exit: { opacity: 0, scale: 0.95, transition: snapTransition },
}
