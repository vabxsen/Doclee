import { useCallback, useRef } from 'react'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useImageDecoder } from '@/hooks/useImageDecoder'
import { SUPPORTED_IMAGE_MIME_TYPES } from '@/lib/constants'
import { snapTransition } from '@/lib/motion'
import { Spinner } from '@/components/ui/Spinner'

export function AddImagesTile() {
  const { ingestFiles, isIngesting } = useImageDecoder()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? [])
      if (files.length > 0) void ingestFiles(files)
      event.target.value = ''
    },
    [ingestFiles],
  )

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={snapTransition}
      onClick={() => inputRef.current?.click()}
      disabled={isIngesting}
      className="focus-ring flex aspect-[3/4] w-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-[16px] border border-dashed border-border-glass text-ink-muted transition-colors hover:bg-white/5 hover:text-ink md:w-full"
    >
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_IMAGE_MIME_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={handleChange}
      />
      {isIngesting ? <Spinner size={18} /> : <Plus className="size-5" />}
      <span className="text-[11px] font-medium">Add images</span>
    </motion.button>
  )
}
