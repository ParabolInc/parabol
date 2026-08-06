import type {IconComponent} from '~/ui/icons'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

interface Props {
  Icon: IconComponent
  tooltip: string
  onClick: React.MouseEventHandler
}
export const LeftNavHeaderButton = (props: Props) => {
  const {Icon, tooltip, onClick} = props
  return (
    <div className='flex size-6 items-center justify-center rounded-sm hover:bg-hairline-strong'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Icon className='hidden size-4 cursor-pointer group-hover:block' onClick={onClick} />
        </TooltipTrigger>
        <TooltipContent side={'bottom'}>{tooltip}</TooltipContent>
      </Tooltip>
    </div>
  )
}
