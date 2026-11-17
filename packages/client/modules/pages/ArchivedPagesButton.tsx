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
}

export const ArchivedPagesButton = (props: Props) => {
  const {onClick, Icon, tooltip, disabled} = props

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          aria-label={tooltip}
          aria-disabled={disabled}
          onClick={disabled ? undefined : onClick}
          className={clsx(
            'flex size-4 items-center justify-center rounded-sm bg-surface-well p-0',
            disabled
              ? 'opacity-50'
              : 'cursor-pointer hover:bg-hairline-strong group-hover:bg-surface-nav-hover group-data-highlighted:bg-surface-nav-active'
          )}
        >
          <Icon className='size-4' />
        </button>
      </TooltipTrigger>
      <TooltipContent side={'bottom'}>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
