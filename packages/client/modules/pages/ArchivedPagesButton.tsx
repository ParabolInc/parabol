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
            'flex size-4 cursor-pointer items-center justify-center rounded-sm bg-slate-200 hover:bg-slate-400 group-hover:bg-slate-300 group-data-highlighted:bg-slate-300'
          }
        >
          <Icon className='size-4' onClick={onClick} />
        </div>
      </TooltipTrigger>
      <TooltipContent side={'bottom'}>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
