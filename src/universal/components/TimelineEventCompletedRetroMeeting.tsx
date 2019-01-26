import {TimelineEventCompletedRetroMeeting_timelineEvent} from '__generated__/TimelineEventCompletedRetroMeeting_timelineEvent.graphql'
import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps} from 'react-router'
import StyledLink from 'universal/components/StyledLink'
import relativeDate from '../utils/relativeDate'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props extends RouteComponentProps<{}> {
  timelineEvent: TimelineEventCompletedRetroMeeting_timelineEvent
}

class TimelineEventCompletedRetroMeeting extends Component<Props> {
  render () {
    const {timelineEvent} = this.props
    const {meeting, team} = timelineEvent
    const {id: meetingId, meetingNumber, createdAt, endedAt, taskCount} = meeting
    const {name: teamName} = team
    const meetingDuration = relativeDate(createdAt, {now: endedAt, max: 2, suffix: false})
    return (
      <TimelineEventCard
        iconName='history'
        timelineEvent={timelineEvent}
        title={
          <TimelineEventTitle
          >{`You completed Retrospective #${meetingNumber} with ${teamName}`}</TimelineEventTitle>
        }
      >
        <TimelineEventBody>
          {`It lasted ${meetingDuration} and generated ${taskCount} tasks.`}
          <br />
          {'See the '}
          <StyledLink to={`/new-summary/${meetingId}`}>Full Summary</StyledLink>
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
