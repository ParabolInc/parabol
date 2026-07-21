import type {SvgIconTypeMap} from '@mui/material'
import type {OverridableComponent} from '@mui/material/OverridableComponent'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

interface Props {
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>
  tooltip: string
  onClick: React.MouseEventHandler
  className?: string
}

export const ArchivedPagesButton = (props: Props) => {
  const {onClick, Icon, tooltip} = props

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={
            'flex size-4 cursor-pointer items-center justify-center rounded-sm bg-surface-well hover:bg-hairline-strong group-hover:bg-surface-nav-active group-data-highlighted:bg-surface-nav-active'
          }
        >
          <Icon className='size-4' onClick={onClick} />
        </div>
      </TooltipTrigger>
      <TooltipContent side={'bottom'}>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
