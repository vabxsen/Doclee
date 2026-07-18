/**
 * React's native drag/animation event handlers collide with framer-motion's
 * own (differently-typed) props of the same name. Any component that spreads
 * generic HTML attributes onto a `motion.*` element needs to omit these first.
 */
export type MotionSafeProps<T> = Omit<
  T,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'
>
