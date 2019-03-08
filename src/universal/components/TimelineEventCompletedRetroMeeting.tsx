import {TimelineEventCompletedRetroMeeting_timelineEvent} from '__generated__/TimelineEventCompletedRetroMeeting_timelineEvent.graphql'
import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import StyledLink from 'universal/components/StyledLink'
import plural from 'universal/utils/plural'
import relativeDate from '../utils/relativeDate'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props {
  timelineEvent: TimelineEventCompletedRetroMeeting_timelineEvent
}

class TimelineEventCompletedRetroMeeting extends Component<Props> {
  render() {
    const {timelineEvent} = this.props
    const {meeting, team} = timelineEvent
    const {id: meetingId, meetingNumber, createdAt, endedAt, taskCount} = meeting
    const {name: teamName} = team
    const meetingDuration = relativeDate(createdAt, {
      now: endedAt,
      max: 2,
      suffix: false,
      smallDiff: 'less than a minute'
    })
    return (
      <TimelineEventCard
        iconName="history"
        timelineEvent={timelineEvent}
        title={
          <TimelineEventTitle>{`Retro #${meetingNumber} with ${teamName} Complete`}</TimelineEventTitle>
        }
      >
        <TimelineEventBody>
          {`It lasted ${meetingDuration} and generated ${taskCount} ${plural(taskCount, 'task')}.`}
          <br />
          <StyledLink to={`/new-summary/${meetingId}`}>See the Full Summary</StyledLink>
          {'.'}
        </TimelineEventBody>
      </TimelineEventCard>
    )
  }
}

export default createFragmentContainer(
  TimelineEventCompletedRetroMeeting,
  graphql`
    fragment TimelineEventCompletedRetroMeeting_timelineEvent on TimelineEventCompletedRetroMeeting {
      ...TimelineEventCard_timelineEvent
      id
      meeting {
        id
        createdAt
        endedAt
        meetingNumber
        taskCount
      }
      team {
        name
      }
    }
  `
)
