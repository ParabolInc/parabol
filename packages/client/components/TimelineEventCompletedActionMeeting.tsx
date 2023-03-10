import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import relativeDate from '../utils/date/relativeDate'
import plural from '../utils/plural'
import {TimelineEventCompletedActionMeeting_timelineEvent$key} from '../__generated__/TimelineEventCompletedActionMeeting_timelineEvent.graphql'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props {
  timelineEvent: TimelineEventCompletedActionMeeting_timelineEvent$key
}

const Link = styled(StyledLink)({
  fontWeight: 600
})

const CountItem = styled('span')({
  fontWeight: 600
})

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
        <CountItem>{`${taskCount} ${plural(taskCount, 'task')}`}</CountItem>
        {', '}
        <CountItem>{`${agendaItemCount} ${plural(agendaItemCount, 'agenda item')}`}</CountItem>
        {' and '}
        <CountItem>{`${commentCount} ${plural(commentCount, 'comment')}.`}</CountItem>
        <br />
        {locked ? (
          canUpgrade && (
            <>
              <Link to={`/me/organizations/${orgId}`} onClick={onUpgrade}>
                Upgrade now
              </Link>{' '}
              to see the discussion in your meeting or review a summary
            </>
          )
        ) : (
          <>
            <Link to={`/meet/${meetingId}/agendaitems/1`}>See the discussion</Link>
            {' in your meeting or '}
            <Link to={`/new-summary/${meetingId}`}>review a summary</Link>
          </>
        )}
      </TimelineEventBody>
    </TimelineEventCard>
  )
}

export default TimelineEventCompletedActionMeeting
