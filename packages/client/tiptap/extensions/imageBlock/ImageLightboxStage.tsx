import {useState} from 'react'
import {KeyboardArrowRight as NextIcon, KeyboardArrowLeft as PrevIcon} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'
import {ImageLightboxZoomBar} from './ImageLightboxZoomBar'
import {usePanZoom} from './usePanZoom'

interface Props {
  src: string
  alt?: string
  hasMany: boolean
  onDismiss: () => void
  onPrev?: () => void
  onNext?: () => void
}

const NAV_BUTTON =
  '-translate-y-1/2 absolute top-1/2 z-10 size-11 rounded-full bg-grape-800 px-0 text-fg-primary shadow-lg ring-1 ring-hairline-strong hover:bg-grape-700'
const KEY = 'rounded-xs bg-surface-hover px-1 font-mono text-[11px] leading-4'

export const ImageLightboxStage = (props: Props) => {
  const {src, alt, hasMany, onDismiss, onPrev, onNext} = props
  const [natural, setNatural] = useState<{width: number; height: number} | null>(null)
  const {stageRef, rect, canPan, imageHandlers, ...zoom} = usePanZoom(natural)
  return (
    <>
      <div
        ref={stageRef}
        className='relative min-h-0 flex-1 overflow-hidden'
        onClick={(e) => {
          if (e.target === e.currentTarget) onDismiss()
        }}
      >
        <img
          src={src}
          alt={alt ?? ''}
          draggable={false}
          onLoad={(e) =>
            setNatural({width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight})
          }
          className={cn(
            'absolute block max-w-none touch-none select-none shadow-[0_16px_48px_rgba(0,0,0,0.5)]',
            natural ? 'opacity-100' : 'opacity-0',
            canPan ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
          )}
          style={{left: rect.left, top: rect.top, width: rect.width, height: rect.height}}
          {...imageHandlers}
        />
        {onPrev && (
          <Button
            variant='flat'
            shape='icon'
            className={cn(NAV_BUTTON, 'left-5')}
            aria-label='Previous image'
            onClick={onPrev}
          >
            <PrevIcon className='text-[28px]' />
          </Button>
        )}
        {onNext && (
          <Button
            variant='flat'
            shape='icon'
            className={cn(NAV_BUTTON, 'right-5')}
            aria-label='Next image'
            onClick={onNext}
          >
            <NextIcon className='text-[28px]' />
          </Button>
        )}
      </div>
      <footer className='relative flex h-17 shrink-0 items-center justify-center'>
        <div className='absolute left-5 hidden items-center gap-1.5 text-fg-muted text-xs md:flex'>
          {hasMany && (
            <>
              <kbd className={KEY}>←</kbd>
              <kbd className={KEY}>→</kbd>
              <span className='mr-1'>to move</span>
            </>
          )}
          <kbd className={KEY}>Esc</kbd>
          <span>to close</span>
        </div>
        <ImageLightboxZoomBar {...zoom} />
      </footer>
    </>
  )
}
