import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import plural from '../utils/plural'
import {TimelineEventTeamPromptComplete_timelineEvent$key} from '../__generated__/TimelineEventTeamPromptComplete_timelineEvent.graphql'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props {
  timelineEvent: TimelineEventTeamPromptComplete_timelineEvent$key
}

const CountItem = styled('span')({
  fontWeight: 600
})

const Link = styled(StyledLink)({
  fontWeight: 600
})

const TimelineEventTeamPromptComplete = (props: Props) => {
  const {timelineEvent: timelineEventRef} = props
  const timelineEvent = useFragment(
    graphql`
      fragment TimelineEventTeamPromptComplete_timelineEvent on TimelineEventTeamPromptComplete {
        ...TimelineEventCard_timelineEvent
        id
        meeting {
          id
          name
          responseCount
          taskCount
          commentCount
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
  if (!meeting) {
    return null
  }

  const {id: meetingId, name: meetingName, responseCount, commentCount, taskCount} = meeting
  const {name: teamName} = team

  return (
    <TimelineEventCard
      iconName='group_work'
      timelineEvent={timelineEvent}
      title={<TimelineEventTitle>{`${meetingName} with ${teamName}`}</TimelineEventTitle>}
    >
      <TimelineEventBody>
        {'Your team shared '}
        <CountItem>
          {responseCount} {plural(responseCount, 'response', 'responses')}
        </CountItem>
        {'.'}
        <br />
        {'You all wrote '}
        <CountItem>
          {commentCount} {plural(commentCount, 'comment', 'comments')}
        </CountItem>
        {' and assigned '}
        <CountItem>
          {taskCount} {plural(taskCount, 'task', 'tasks')}
        </CountItem>
        {'.'}
        <br />
        <Link to={`/meet/${meetingId}/responses`}>See responses and discussions</Link>
        {' or '}
        <Link to={`/new-summary/${meetingId}`}>review a summary</Link>
      </TimelineEventBody>
    </TimelineEventCard>
  )
}

export default TimelineEventTeamPromptComplete
