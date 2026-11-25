import {Add as AddIcon, Remove as RemoveIcon} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'

interface Props {
  scale: number
  isFit: boolean
  canZoomIn: boolean
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
  zoomToActual: () => void
}

const PILL = 'h-8 min-w-8 rounded-full px-2 font-semibold text-fg-primary text-sm'

export const ImageLightboxZoomBar = (props: Props) => {
  const {scale, isFit, canZoomIn, zoomIn, zoomOut, reset, zoomToActual} = props
  const isActual = Math.abs(scale - 1) < 0.001
  return (
    <div
      role='group'
      aria-label='Zoom'
      className='flex h-10 items-center gap-0.5 rounded-full bg-grape-800 px-1 ring-1 ring-hairline-strong'
    >
      <Button
        variant='flat'
        className={PILL}
        aria-label='Zoom out'
        disabled={isFit}
        onClick={zoomOut}
      >
        <RemoveIcon className='text-lg' />
      </Button>
      <span aria-live='polite' className='min-w-13 text-center font-semibold text-sm tabular-nums'>
        {Math.round(scale * 100)}%
      </span>
      <Button
        variant='flat'
        className={PILL}
        aria-label='Zoom in'
        disabled={!canZoomIn}
        onClick={zoomIn}
      >
        <AddIcon className='text-lg' />
      </Button>
      <div className='mx-1 h-[18px] w-px bg-hairline-strong' />
      <Button variant='flat' className={cn(PILL, isFit && 'bg-surface-hover')} onClick={reset}>
        Fit
      </Button>
      <Button
        variant='flat'
        className={cn(PILL, isActual && 'bg-surface-hover')}
        onClick={zoomToActual}
      >
        100%
      </Button>
    </div>
  )
}
