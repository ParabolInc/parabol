import type {IconComponent} from '~/ui/icons'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

interface Props {
  Icon: IconComponent
  tooltip: string
  onClick: React.MouseEventHandler
}
export const LeftNavItemButton = (props: Props) => {
  const {Icon, tooltip, onClick} = props
  return (
    <div className='flex size-6 items-center justify-center rounded-sm hover:bg-surface-nav-button-hover'>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type='button'
            aria-label={tooltip}
            className='hidden size-4 cursor-pointer items-center justify-center group-hover:flex'
            onClick={onClick}
          >
            <Icon className='size-4' />
          </button>
        </TooltipTrigger>
        <TooltipContent side={'bottom'}>{tooltip}</TooltipContent>
      </Tooltip>
    </div>
  )
}
