import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import plural from '../utils/plural'
import {TimelineEventCompletedRetroMeeting_timelineEvent$key} from '../__generated__/TimelineEventCompletedRetroMeeting_timelineEvent.graphql'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props {
  timelineEvent: TimelineEventCompletedRetroMeeting_timelineEvent$key
}

const CountItem = styled('span')({
  fontWeight: 600
})

const Link = styled(StyledLink)({
  fontWeight: 600
})

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
    organization
  } = meeting
  const {name: teamName} = team
  const {id: orgId, viewerOrganizationUser} = organization
  const canUpgrade = !!viewerOrganizationUser

  const atmosphere = useAtmosphere()
  const onUpgrade = () => {
    SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Clicked', {
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
        <CountItem>
          {reflectionCount} {plural(reflectionCount, 'reflection')}
        </CountItem>
        {' and grouped them into '}
        <CountItem>
          {topicCount} {plural(topicCount, 'topic')}
        </CountItem>
        {'.'}
        <br />
        {'You added '}
        <CountItem>
          {commentCount} {plural(commentCount, 'comment')}
        </CountItem>
        {' and created '}
        <CountItem>
          {taskCount} {plural(taskCount, 'task')}
        </CountItem>
        {'.'}
        <br />
        {locked ? (
          canUpgrade && (
            <>
              <Link to={`/me/organizations/${orgId}`} onClick={onUpgrade}>
                Upgrade now
              </Link>{' '}
              to get access to the summary and discussion
            </>
          )
        ) : (
          <>
            <Link to={`/meet/${meetingId}/discuss/1`}>See the discussion</Link>
            {' in your meeting or '}
            <Link to={`/new-summary/${meetingId}`}>review a summary</Link>
          </>
        )}
      </TimelineEventBody>
    </TimelineEventCard>
  )
}

export default TimelineEventCompletedRetroMeeting
