import CloseIcon from '@mui/icons-material/Close'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

interface Props {
  onClick: (e: React.MouseEvent) => void
}

export const ClearFilterIcon = (props: Props) => {
  const {onClick} = props
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className='ml-0.5 flex size-4 cursor-pointer items-center justify-center rounded-md p-1 hover:bg-slate-400 group-hover:bg-slate-300'
          onClick={onClick}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <CloseIcon className='size-3' />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <span>Clear filter</span>
      </TooltipContent>
    </Tooltip>
  )
}
