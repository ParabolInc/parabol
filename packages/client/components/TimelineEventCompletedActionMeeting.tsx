import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TimelineEventCompletedActionMeeting_timelineEvent$key} from '../__generated__/TimelineEventCompletedActionMeeting_timelineEvent.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import relativeDate from '../utils/date/relativeDate'
import {GQLID} from '../utils/GQLID'
import plural from '../utils/plural'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import StyledLink from './StyledLink'
import TimelineEventTitle from './TImelineEventTitle'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'

interface Props {
  timelineEvent: TimelineEventCompletedActionMeeting_timelineEvent$key
}

const TimelineEventCompletedActionMeeting = (props: Props) => {
  const {timelineEvent: timelineEventRef} = props
  const timelineEvent = useFragment(
    graphql`
      fragment TimelineEventCompletedActionMeeting_timelineEvent on TimelineEventCompletedActionMeeting {
        ...TimelineEventCard_timelineEvent
        id
        type
        meeting {
          id
          agendaItemCount
          commentCount
          createdAt
          endedAt
          name
          taskCount
          locked
          organization {
            id
            viewerOrganizationUser {
              id
            }
          }
          summaryPageId
        }
        team {
          id
          name
        }
      }
    `,
    timelineEventRef
  )
  const {meeting, team} = timelineEvent
  const {
    id: meetingId,
    name: meetingName,
    createdAt,
    endedAt,
    agendaItemCount,
    commentCount,
    taskCount,
    locked,
    organization,
    summaryPageId
  } = meeting
  const {name: teamName} = team
  const {id: orgId, viewerOrganizationUser} = organization
  const canUpgrade = !!viewerOrganizationUser
  const summaryURL = summaryPageId
    ? `/pages/${GQLID.fromKey(summaryPageId)[0]}`
    : `/new-summary/${meetingId}`
  const atmosphere = useAtmosphere()
  const onUpgrade = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'timelineHistoryLock',
      upgradeTier: 'team',
      meetingId
    })
  }

  const meetingDuration = relativeDate(createdAt, {
    now: endedAt,
    max: 2,
    suffix: false,
    smallDiff: 'less than a minute'
  })
  return (
    <TimelineEventCard
      iconName={locked && canUpgrade ? 'lock' : 'change_history'}
      timelineEvent={timelineEvent}
      title={<TimelineEventTitle>{`${meetingName} with ${teamName} Complete`}</TimelineEventTitle>}
    >
      <TimelineEventBody>
        {`It lasted ${meetingDuration} and generated `}
        <span className='font-semibold'>{`${taskCount} ${plural(taskCount, 'task')}`}</span>
        {', '}
        <span className='font-semibold'>{`${agendaItemCount} ${plural(agendaItemCount, 'agenda item')}`}</span>
        {' and '}
        <span className='font-semibold'>{`${commentCount} ${plural(commentCount, 'comment')}.`}</span>
        <br />
        {locked ? (
          canUpgrade && (
            <>
              <StyledLink
                className='font-semibold'
                to={`/me/organizations/${orgId}`}
                onClick={onUpgrade}
              >
                Upgrade now
              </StyledLink>{' '}
              to see the discussion in your meeting or review a summary
            </>
          )
        ) : (
          <>
            <StyledLink className='font-semibold' to={`/meet/${meetingId}/agendaitems/1`}>
              See the discussion
            </StyledLink>
            {' in your meeting or '}
            <StyledLink className='font-semibold' to={summaryURL}>
              review a summary
            </StyledLink>
          </>
        )}
      </TimelineEventBody>
    </TimelineEventCard>
  )
}

export default TimelineEventCompletedActionMeeting
