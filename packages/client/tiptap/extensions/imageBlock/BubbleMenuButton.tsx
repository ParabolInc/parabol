import {cn} from '../../../ui/cn'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'

interface Props {
  Icon: React.ComponentType<{
    fontSize: 'small' | 'inherit' | 'large' | undefined
    className?: string
  }>
  isActive?: boolean
  onClick: () => void
  className?: string
  title: string
  children?: React.ReactNode
}
export const BubbleMenuButton = (props: Props) => {
  const {Icon, isActive, onClick, className, title} = props
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          data-active={isActive ? '' : undefined}
          className={cn(
            'flex cursor-pointer items-center justify-center rounded-sm p-1 transition-colors hover:bg-slate-300 data-active:bg-slate-300',
            className
          )}
        >
          <Icon fontSize='small' className='text-slate-700' />
        </button>
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  )
}
