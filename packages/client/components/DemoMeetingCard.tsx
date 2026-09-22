import {useCallback} from 'react'
import {Link} from 'react-router'
import useAtmosphere from '../hooks/useAtmosphere'
import {TeamHealthDemo} from '../modules/demo/teamHealthDemoIds'
import {cn} from '../ui/cn'
import {meetingTypeToBgClass, meetingTypeToIllustration} from '../utils/meetings/lookups'
import SendClientSideEvent from '../utils/SendClientSideEvent'

type DemoType = 'retrospective' | 'teamHealth'

const demoLookup: Record<DemoType, {to: string; badge: string; title: string; subtitle: string}> = {
  retrospective: {
    to: '/retrospective-demo',
    badge: 'Retro',
    title: 'Retrospective Demo',
    subtitle: 'Demo team • Reflect'
  },
  teamHealth: {
    to: TeamHealthDemo.ROUTE,
    badge: 'Team Health',
    title: 'Team Health Demo',
    subtitle: 'Demo team • Results'
  }
}

interface Props {
  type: DemoType
}

const DemoMeetingCard = (props: Props) => {
  const {type} = props
  const {to, badge, title, subtitle} = demoLookup[type]
  const atmosphere = useAtmosphere()

  const onOpen = useCallback(() => {
    SendClientSideEvent(atmosphere, 'Demo Meeting Card Clicked', {meetingType: type})
  }, [type])

  return (
    <div
      className='m-3 fuzzy-tablet:w-80 w-[calc(100%-24px)] max-w-full shrink-0 select-none rounded-card bg-surface-card shadow-[var(--shadow-card)] [transition:box-shadow_100ms_cubic-bezier(0,0,.2,1),opacity_300ms_cubic-bezier(0,0,.2,1)] hover:shadow-[var(--shadow-card-hover)]'
      onClick={onOpen}
    >
      <Link to={to}>
        <div className='relative block rounded-t-card'>
          <div
            className={cn(
              'absolute top-0 bottom-1.5 block w-full rounded-t-card',
              meetingTypeToBgClass[type]
            )}
          />
          <span className='absolute top-2 left-2 font-semibold text-white text-xs'>{badge}</span>
          <img
            src={meetingTypeToIllustration[type]}
            alt=''
            className='relative mx-auto block h-45 overflow-hidden rounded-t-card pt-6 dark:brightness-[.94]'
          />
        </div>
        <div className='pt-1 pr-2 pb-3 pl-4'>
          <div className='relative flex'>
            <span className='wrap-break-word block py-1 pr-8 text-fg-primary text-xl leading-6'>
              {title}
            </span>
          </div>
          <span className='wrap-break-word block pb-1 text-fg-secondary text-sm'>{subtitle}</span>
        </div>
      </Link>
    </div>
  )
}

export default DemoMeetingCard
