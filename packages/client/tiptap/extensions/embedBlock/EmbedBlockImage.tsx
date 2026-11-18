import {type ReactNode, useLayoutEffect, useRef, useState} from 'react'
import {cn} from '../../../ui/cn'

interface Props {
  src: string
  className?: string
  fallback: ReactNode
}

type LoadStatus = {src: string; isLoaded: boolean}

// A site may refuse to serve its image to other sites until the server hosts a copy, so nothing paints until it loads
export const EmbedBlockImage = (props: Props) => {
  const {src, className, fallback} = props
  const imgRef = useRef<HTMLImageElement>(null)
  const [status, setStatus] = useState<LoadStatus | null>(null)
  const isSettled = status?.src === src
  useLayoutEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) setStatus({src, isLoaded: true})
  }, [src])
  if (isSettled && !status.isLoaded) return fallback
  return (
    <img
      ref={imgRef}
      src={src}
      alt=''
      referrerPolicy='no-referrer'
      loading='lazy'
      className={cn(className, !isSettled && 'invisible')}
      onLoad={() => setStatus({src, isLoaded: true})}
      onError={() => setStatus({src, isLoaded: false})}
    />
  )
}
