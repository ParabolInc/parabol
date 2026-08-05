import DeleteIcon from '@mui/icons-material/Delete'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint} from '../types/constEnums'
import {cn} from '../ui/cn'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'

const headerCardClassName =
  'relative mx-auto h-full w-full max-w-[1504px] rounded bg-surface-card px-4 py-3 shadow-[var(--shadow-card)]'

const cardDescriptionClassName =
  'm-0 font-normal text-[14px] text-fg-primary leading-5 transition-all duration-300'

interface Props {
  service?: string
  onRemove: () => void
}
const PokerEstimateHeaderCardError = (props: Props) => {
  const {onRemove, service} = props
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  if (!service) {
    return (
      <div className={cn('flex pb-1', isDesktop ? 'px-4' : 'px-2')}>
        <div className={headerCardClassName}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className='absolute top-2 right-2 cursor-pointer bg-inherit'>
                <DeleteIcon onClick={() => onRemove()} />
              </button>
            </TooltipTrigger>
            <TooltipContent side='bottom' align='center' sideOffset={2} className=''>
              {'Remove from Scope'}
            </TooltipContent>
          </Tooltip>
          <div className='flex w-full items-start justify-between'>
            <h1 className='m-0 mb-2 text-[16px] leading-6'>{`That story doesn't exist!`}</h1>
          </div>
          <div className={cn(cardDescriptionClassName, 'max-h-[30px] overflow-y-hidden')}>
            {`The story was deleted. You can add another story in the Scope phase.`}
          </div>
        </div>
      </div>
    )
  }
  const serviceName = service.charAt(0).toUpperCase() + service.slice(1)
  return (
    <div className={cn('flex pb-1', isDesktop ? 'px-4' : 'px-2')}>
      <div className={headerCardClassName}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className='absolute top-2 right-2 cursor-pointer bg-inherit'>
              <DeleteIcon onClick={() => onRemove()} />
            </button>
          </TooltipTrigger>
          <TooltipContent side='bottom' align='center' sideOffset={2} className=''>
            {'Remove from Scope'}
          </TooltipContent>
        </Tooltip>
        <div className='flex w-full items-start justify-between'>
          <h1 className='m-0 mb-2 text-[16px] leading-6'>{`${serviceName} is Down!`}</h1>
        </div>
        <div className={cn(cardDescriptionClassName, 'max-h-[300px] overflow-y-auto')}>
          {`Cannot connect to ${serviceName}. Voting will be disabled. If the problem persists, please re-add the issue or re-integrate.`}
        </div>
      </div>
    </div>
  )
}

export default PokerEstimateHeaderCardError
