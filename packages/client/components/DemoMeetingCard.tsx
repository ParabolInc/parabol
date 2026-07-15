import {useCallback} from 'react'
import {Link} from 'react-router'
import retrospective from '../../../static/images/illustrations/retrospective.png'
import useAtmosphere from '../hooks/useAtmosphere'
import {cn} from '../ui/cn'
import SendClientSideEvent from '../utils/SendClientSideEvent'

const BACKGROUND_CLASSES = {
  retrospective: 'bg-grape-500',
  action: 'bg-aqua-400',
  poker: 'bg-tomato-400',
  teamPrompt: 'bg-jade-400'
} as const

const DemoMeetingCard = () => {
  const atmospehere = useAtmosphere()

  const onOpen = useCallback(() => {
    SendClientSideEvent(atmospehere, 'Demo Meeting Card Clicked')
  }, [])

  return (
    <div
      className='m-2 fuzzy-tablet:w-80 w-[calc(100%-16px)] max-w-full shrink-0 select-none rounded-card bg-surface-card shadow-card [transition:box-shadow_100ms_cubic-bezier(0,0,.2,1),opacity_300ms_cubic-bezier(0,0,.2,1)] hover:shadow-card-hover'
      onClick={onOpen}
    >
      <Link to={`/retrospective-demo`}>
        <div className='relative block rounded-t-card'>
          <div
            className={cn(
              'absolute top-0 bottom-1.5 block w-full rounded-t-card',
              BACKGROUND_CLASSES.retrospective
            )}
          />
          <span className='absolute top-2 left-2 font-semibold text-white text-xs'>Retro</span>
          <img
            src={retrospective}
            alt=''
            className='relative mx-auto block h-45 overflow-hidden rounded-t-card pt-6 dark:brightness-[.94]'
          />
        </div>
        <div className='pt-1 pr-2 pb-3 pl-4'>
          <div className='relative flex'>
            <span className='wrap-break-word block py-1 pr-8 text-fg-primary text-xl leading-6'>
              Retrospective Demo
            </span>
          </div>
          <span className='wrap-break-word block pb-1 text-fg-secondary text-sm'>
            Demo team • Reflect
          </span>
        </div>
      </Link>
    </div>
  )
}

export default DemoMeetingCard
