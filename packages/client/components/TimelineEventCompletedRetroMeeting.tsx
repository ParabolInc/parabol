import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TimelineEventCompletedRetroMeeting_timelineEvent$key} from '../__generated__/TimelineEventCompletedRetroMeeting_timelineEvent.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {GQLID} from '../utils/GQLID'
import plural from '../utils/plural'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import StyledLink from './StyledLink'
import TimelineEventTitle from './TImelineEventTitle'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'

interface Props {
  timelineEvent: TimelineEventCompletedRetroMeeting_timelineEvent$key
}

const TimelineEventCompletedRetroMeeting = (props: Props) => {
  const {timelineEvent: timelineEventRef} = props
  const timelineEvent = useFragment(
    graphql`
      fragment TimelineEventCompletedRetroMeeting_timelineEvent on TimelineEventCompletedRetroMeeting {
        ...TimelineEventCard_timelineEvent
        id
        meeting {
          id
          commentCount
          name
          reflectionCount
          taskCount
          topicCount
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
    commentCount,
    reflectionCount,
    topicCount,
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

  return (
    <TimelineEventCard
      iconName={locked && canUpgrade ? 'lock' : 'history'}
      timelineEvent={timelineEvent}
      title={<TimelineEventTitle>{`${meetingName} with ${teamName} Complete`}</TimelineEventTitle>}
    >
      <TimelineEventBody>
        {'Your team shared '}
        <span className='font-semibold'>
          {reflectionCount} {plural(reflectionCount, 'reflection')}
        </span>
        {' and grouped them into '}
        <span className='font-semibold'>
          {topicCount} {plural(topicCount, 'topic')}
        </span>
        {'.'}
        <br />
        {'You added '}
        <span className='font-semibold'>
          {commentCount} {plural(commentCount, 'comment')}
        </span>
        {' and created '}
        <span className='font-semibold'>
          {taskCount} {plural(taskCount, 'task')}
        </span>
        {'.'}
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
              to get access to the summary and discussion
            </>
          )
        ) : (
          <>
            <StyledLink className='font-semibold' to={`/meet/${meetingId}/discuss/1`}>
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

export default TimelineEventCompletedRetroMeeting
