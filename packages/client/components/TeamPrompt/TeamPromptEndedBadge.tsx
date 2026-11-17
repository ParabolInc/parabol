import {Link} from 'react-router'
import useBreakpoint from '../../hooks/useBreakpoint'
import useRefreshInterval from '../../hooks/useRefreshInterval'
import {Breakpoint} from '../../types/constEnums'
import {cn} from '../../ui/cn'
import {humanReadableCountdown} from '../../utils/date/relativeDate'
import {TeamPromptBadge} from './TeamPromptBadge'

interface NextMeetingLinkProps {
  closestActiveMeetingId: string
}

export const NextMeetingLink = (props: NextMeetingLinkProps) => {
  const {closestActiveMeetingId} = props
  return (
    <Link className='font-normal underline' to={`/meet/${closestActiveMeetingId}`}>
      Go to the current activity.
    </Link>
  )
}

interface NextMeetingCountdownProps {
  nextMeetingDate: Date
}

export const NextMeetingCountdown = (props: NextMeetingCountdownProps) => {
  const {nextMeetingDate} = props
  useRefreshInterval(1000)

  const fromNow = humanReadableCountdown(nextMeetingDate)
  if (!fromNow) return null

  return <span>Next one starts in {humanReadableCountdown(nextMeetingDate)}.</span>
}

// here we just want one of the props to be present, never both
type Props = {closestActiveMeetingId: string} | {nextMeetingDate: Date} | Record<string, never>

export const TeamPromptEndedBadge = (props: Props) => {
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const renderAdditionalInfo = () => {
    if ('closestActiveMeetingId' in props) {
      return <NextMeetingLink closestActiveMeetingId={props.closestActiveMeetingId} />
    }

    if ('nextMeetingDate' in props) {
      return <NextMeetingCountdown nextMeetingDate={props.nextMeetingDate} />
    }

    return null
  }

  return (
    <TeamPromptBadge>
      <div className='flex items-center justify-center'>
        <span className='pr-2'>✅</span>{' '}
        <span className={cn('inline-block overflow-hidden break-words', !isDesktop && 'w-[220px]')}>
          This activity has ended. {renderAdditionalInfo()}
        </span>
      </div>
    </TeamPromptBadge>
  )
}
