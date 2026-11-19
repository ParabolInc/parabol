import {cn} from '../ui/cn'
import {Public} from '../ui/icons'
import getTileColorClass from './OAuthConsent/getTileColorClass'
import BaseTag from './Tag/BaseTag'

const TILE_CLASS =
  'flex size-6 shrink-0 items-center justify-center rounded-md font-bold text-white text-xs'

interface Props {
  name: string
  verifiedAt: string | null | undefined
}

const AIAppIdentity = ({name, verifiedAt}: Props) => (
  <div className='flex items-center gap-2'>
    {verifiedAt ? (
      <span aria-hidden='true' className={cn(TILE_CLASS, getTileColorClass(name))}>
        {name.charAt(0).toUpperCase()}
      </span>
    ) : (
      <span
        aria-hidden='true'
        className={cn(
          TILE_CLASS,
          'bg-surface-well text-fg-secondary ring-1 ring-hairline-strong ring-inset'
        )}
      >
        <Public className='text-base' />
      </span>
    )}
    <div className='flex min-w-0 flex-col items-start gap-0.5'>
      <span className='wrap-anywhere font-medium text-fg-primary'>{name}</span>
      {verifiedAt ? (
        <BaseTag className='ml-0 bg-jade-700 text-white'>Verified</BaseTag>
      ) : (
        <BaseTag className='ml-0 bg-slate-600 text-white'>Unverified</BaseTag>
      )}
    </div>
  </div>
)

export default AIAppIdentity
