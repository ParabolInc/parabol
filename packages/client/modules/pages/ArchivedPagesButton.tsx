import clsx from 'clsx'
import type {IconComponent} from '~/ui/icons'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

interface Props {
  Icon: IconComponent
  tooltip: string
  onClick: React.MouseEventHandler
  disabled?: boolean
  className?: string
}

export const ArchivedPagesButton = (props: Props) => {
  const {onClick, Icon, tooltip, disabled} = props

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          aria-label={tooltip}
          aria-disabled={disabled}
          className={clsx(
            'flex size-4 items-center justify-center rounded-sm bg-surface-well',
            disabled
              ? 'opacity-50'
              : 'cursor-pointer hover:bg-hairline-strong group-hover:bg-surface-nav-hover group-data-highlighted:bg-surface-nav-active'
          )}
        >
          <Icon className='size-4' onClick={disabled ? undefined : onClick} />
        </div>
      </TooltipTrigger>
      <TooltipContent side={'bottom'}>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
