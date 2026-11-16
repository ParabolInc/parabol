import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint} from '../types/constEnums'
import {cn} from '../ui/cn'

const PokerEstimateHeaderCardSkeleton = () => {
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  return (
    <div className={cn('flex pb-1', isDesktop ? 'px-4' : 'px-2')} aria-busy='true'>
      <div className='mx-auto w-full max-w-[1504px] rounded bg-surface-card p-3 px-4 shadow-[var(--shadow-card)]'>
        <div className='mb-2 flex h-6 items-center'>
          <div className='h-4 w-1/3 animate-pulse rounded bg-surface-well' />
        </div>
        <div className='flex h-5 items-center'>
          <div className='h-3 w-full animate-pulse rounded-sm bg-surface-well' />
        </div>
        <div className='flex h-5 items-center'>
          <div className='h-3 w-2/3 animate-pulse rounded-sm bg-surface-well' />
        </div>
        <div className='mt-2.5 flex h-5 items-center'>
          <div className='h-3 w-16 animate-pulse rounded-sm bg-surface-well' />
        </div>
      </div>
    </div>
  )
}

export default PokerEstimateHeaderCardSkeleton
