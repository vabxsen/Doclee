import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { decodeImageFile } from '@/services/imageDecoding/decodeImageFile'
import { putFileBlob } from '@/services/storage/localFileCache'
import { useDocumentStore } from '@/store/useDocumentStore'
import { DEFAULT_EDITS } from '@/types/image'
import type { ImageAsset } from '@/types/image'
import { createId } from '@/utils/id'

export function useImageDecoder() {
  const addImages = useDocumentStore((state) => state.addImages)
  const [isIngesting, setIsIngesting] = useState(false)

  const ingestFiles = useCallback(
    async (files: File[]) => {
      setIsIngesting(true)
      const assets: ImageAsset[] = []

      for (const file of files) {
        try {
          const { width, height } = await decodeImageFile(file)
          const blobRefId = createId('blob')
          await putFileBlob(blobRefId, file)
          assets.push({
            id: createId('img'),
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            blobRefId,
            naturalWidth: width,
            naturalHeight: height,
            edits: DEFAULT_EDITS,
            createdAt: Date.now(),
          })
        } catch (error) {
          console.error(`Failed to decode ${file.name}`, error)
          toast.error(`Couldn't read "${file.name}" — the file may be corrupted or unsupported.`)
        }
      }

      if (assets.length > 0) addImages(assets)
      setIsIngesting(false)
    },
    [addImages],
  )

  return { ingestFiles, isIngesting }
}
