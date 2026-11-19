import {cn} from '../../ui/cn'
import {Public, SwapHoriz} from '../../ui/icons'
import getTileColorClass from './getTileColorClass'

const TILE_CLASS =
  'flex size-14 shrink-0 items-center justify-center rounded-[14px] font-bold text-2xl text-white'

interface Props {
  appName: string
  isUnverified: boolean
}

const OAuthConsentAppTiles = ({appName, isUnverified}: Props) => (
  <div aria-hidden='true' className='flex items-center justify-center gap-3.5 text-fg-muted'>
    {isUnverified ? (
      <span
        className={cn(
          TILE_CLASS,
          'bg-surface-well text-fg-secondary ring-1 ring-hairline-strong ring-inset'
        )}
      >
        <Public className='text-[28px]' />
      </span>
    ) : (
      <span className={cn(TILE_CLASS, getTileColorClass(appName))}>
        {appName.charAt(0).toUpperCase()}
      </span>
    )}
    <span className='w-10 border-hairline-strong border-t-2 border-dashed' />
    <SwapHoriz className='text-xl' />
    <span className='w-10 border-hairline-strong border-t-2 border-dashed' />
    <span className={cn(TILE_CLASS, 'bg-linear-135 from-tomato-500 to-rose-500')}>P</span>
  </div>
)

export default OAuthConsentAppTiles
