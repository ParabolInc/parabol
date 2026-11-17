import {Lock as LockIcon} from '~/ui/icons'
import {cn} from '../../ui/cn'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

interface Props {
  className?: string
}

export const PageNoAccessLock = (props: Props) => {
  const {className} = props
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role='img'
          aria-label="You don't have access to this page"
          className={cn('inline-flex items-center text-fg-muted', className)}
        >
          <LockIcon className='text-[1em]' />
        </span>
      </TooltipTrigger>
      <TooltipContent side='bottom'>
        {"You don't have access. Open it to request access."}
      </TooltipContent>
    </Tooltip>
  )
}
