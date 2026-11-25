import * as RadixDialog from '@radix-ui/react-dialog'
import {useRef, useState} from 'react'
import {ImageLightboxHeader} from './ImageLightboxHeader'
import {ImageLightboxStage} from './ImageLightboxStage'

export interface LightboxImage {
  src: string
  alt?: string
}

interface Props {
  images: LightboxImage[]
  startIndex: number
  onClose: () => void
}

export const ImageLightbox = (props: Props) => {
  const {images, startIndex, onClose} = props
  const [index, setIndex] = useState(startIndex)
  const contentRef = useRef<HTMLDivElement>(null)
  const image = images[index]
  if (!image) return null
  const count = images.length
  const go = (delta: number) => setIndex((i) => Math.min(count - 1, Math.max(0, i + delta)))
  return (
    <RadixDialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay className='fade-in fixed inset-0 z-30 animate-in bg-grape-950' />
        <RadixDialog.Content
          ref={contentRef}
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            contentRef.current?.focus()
          }}
          className='theme-dark fade-in fixed inset-0 z-30 flex animate-in flex-col text-fg-primary outline-hidden'
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') go(-1)
            else if (e.key === 'ArrowRight') go(1)
          }}
        >
          <ImageLightboxHeader index={index} count={count} src={image.src} alt={image.alt} />
          <ImageLightboxStage
            key={`${index}:${image.src}`}
            src={image.src}
            alt={image.alt}
            hasMany={count > 1}
            onDismiss={onClose}
            onPrev={index > 0 ? () => go(-1) : undefined}
            onNext={index < count - 1 ? () => go(1) : undefined}
          />
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
