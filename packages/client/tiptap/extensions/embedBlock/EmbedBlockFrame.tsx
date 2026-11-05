import {useEffect, useRef, useState} from 'react'
import type {EmbedAspectRatio} from '../../../shared/embed/embedTypes'
import {ASPECT_RATIO_PADDING} from '../../../shared/tiptap/extensions/EmbedBlockBase'
import {cn} from '../../../ui/cn'

interface Props {
  embedSrc: string
  title: string
  aspectRatio: EmbedAspectRatio
  thumbnailUrl?: string
  /** While true the frame ignores pointer events so hover reaches the editor */
  isInert?: boolean
}

export const EmbedBlockFrame = (props: Props) => {
  const {embedSrc, title, aspectRatio, thumbnailUrl, isInert} = props
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // A page with twenty videos must not boot twenty players on load
  useEffect(() => {
    const el = containerRef.current
    if (!el || isVisible) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {rootMargin: '200px'}
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isVisible])

  const paddingBottom = ASPECT_RATIO_PADDING[aspectRatio] ?? ASPECT_RATIO_PADDING['16:9']

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-0 w-full overflow-hidden rounded-md bg-surface-well',
        isInert && 'cursor-pointer'
      )}
      style={{paddingBottom}}
    >
      {isVisible ? (
        <iframe
          src={embedSrc}
          title={title}
          loading='lazy'
          referrerPolicy='strict-origin-when-cross-origin'
          sandbox='allow-scripts allow-same-origin allow-popups allow-presentation allow-forms'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture'
          allowFullScreen
          className={cn(
            'absolute top-0 left-0 h-full w-full border-0',
            isInert && 'pointer-events-none'
          )}
        />
      ) : (
        <div className='absolute top-0 left-0 flex h-full w-full items-center justify-center'>
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt=''
              referrerPolicy='no-referrer'
              loading='lazy'
              className='h-full w-full object-cover'
            />
          ) : null}
        </div>
      )}
    </div>
  )
}
