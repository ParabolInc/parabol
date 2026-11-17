import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import type {MeetingTypeEnum} from '../__generated__/MeetingSeriesGroupCard_series.graphql'
import type {MeetingSeriesManager_user$key} from '../__generated__/MeetingSeriesManager_user.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {cn} from '../ui/cn'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import {meetingTypeToLabelClass} from '../utils/meetings/lookups'
import Avatar from './Avatar/Avatar'

interface Props {
  userRef: MeetingSeriesManager_user$key
  meetingType: MeetingTypeEnum
  /** the series is one of several scheduled together across teams */
  isGroup: boolean
}

/**
 * The tag on a series card naming who administers it, in the spot the group card uses for its
 * team count. The tooltip carries the rest: a series someone else owns cannot be rescheduled
 * from this card, so it says who can.
 */
const MeetingSeriesManager = (props: Props) => {
  const {userRef, meetingType, isGroup} = props
  const user = useFragment(
    graphql`
      fragment MeetingSeriesManager_user on User {
        id
        preferredName
        picture
      }
    `,
    userRef
  )
  const atmosphere = useAtmosphere()
  const {id: userId, preferredName, picture} = user
  const isViewer = userId === atmosphere.viewerId
  const subject = isGroup ? 'meeting series group' : 'meeting series'
  // the owner only meets this tag when a team filter has narrowed their group to one card, so
  // point them back at the group card, which is where the group is administered
  const isOwnGroup = isViewer && isGroup
  const label = isOwnGroup ? 'Your group' : isViewer ? 'You' : preferredName
  const tooltip = isOwnGroup
    ? 'You own this meeting series group. Manage it from the group card on the Meetings page.'
    : isViewer
      ? `You manage this ${subject}`
      : `${preferredName} manages this ${subject}`
  const pillClassName = cn(
    'absolute bottom-3.5 left-2 flex max-w-[calc(100%-16px)] items-center gap-1.5 rounded-[64px] bg-[#fffc] py-1 pr-2.5 pl-1.5 font-semibold text-[11px] leading-3',
    isOwnGroup && 'hover:bg-white',
    meetingTypeToLabelClass[meetingType]
  )
  const content = (
    <>
      <Avatar picture={picture} alt='' className='size-4' />
      <span className='truncate'>{label}</span>
    </>
  )
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {isOwnGroup ? (
          <Link to='/meetings' className={pillClassName}>
            {content}
          </Link>
        ) : (
          <div className={pillClassName}>{content}</div>
        )}
      </TooltipTrigger>
      <TooltipContent side='bottom'>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

export default MeetingSeriesManager
