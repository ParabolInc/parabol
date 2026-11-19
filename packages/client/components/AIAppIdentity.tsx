import {cn} from '../ui/cn'
import {Check, PriorityHigh, Public} from '../ui/icons'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import getTileColorClass from './OAuthConsent/getTileColorClass'

const TILE_CLASS =
  'relative flex size-6 shrink-0 items-center justify-center rounded-md font-bold text-white text-xs'
const BADGE_CLASS =
  'absolute -right-1.5 -bottom-1.5 flex size-3 items-center justify-center rounded-full ring-2 ring-surface-card'

interface Props {
  name: string
  host: string
  verifiedAt: string | null | undefined
}

const AIAppIdentity = ({name, host, verifiedAt}: Props) => {
  const status = verifiedAt ? 'Verified by Parabol' : `Unverified: identified only by ${host}`
  return (
    <div className='flex items-center gap-3'>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role='img'
            aria-label={status}
            className={cn(
              TILE_CLASS,
              verifiedAt
                ? getTileColorClass(name)
                : 'bg-surface-well text-fg-secondary ring-1 ring-hairline-strong ring-inset'
            )}
          >
            {verifiedAt ? name.charAt(0).toUpperCase() : <Public className='text-base' />}
            <span
              className={cn(
                BADGE_CLASS,
                verifiedAt ? 'bg-jade-700 text-white' : 'bg-gold-300 text-gold-900'
              )}
            >
              {verifiedAt ? (
                <Check className='text-[10px]' />
              ) : (
                <PriorityHigh className='text-[10px]' />
              )}
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent>{status}</TooltipContent>
      </Tooltip>
      <span className='wrap-anywhere font-medium text-fg-primary'>{name}</span>
    </div>
  )
}

export default AIAppIdentity
