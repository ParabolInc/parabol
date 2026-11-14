import {cn} from '../../../ui/cn'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'

interface Props {
  Icon: React.ComponentType<{className?: string}>
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
            'flex cursor-pointer items-center justify-center rounded-sm p-1 transition-colors hover:bg-surface-hover data-active:bg-surface-hover',
            className
          )}
        >
          <Icon className='text-[20px] text-fg-primary' />
        </button>
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  )
}
