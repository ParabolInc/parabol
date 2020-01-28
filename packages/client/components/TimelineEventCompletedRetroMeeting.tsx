import {TimelineEventCompletedRetroMeeting_timelineEvent} from '../__generated__/TimelineEventCompletedRetroMeeting_timelineEvent.graphql'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import StyledLink from './StyledLink'
import plural from '../utils/plural'
import relativeDate from '../utils/date/relativeDate'
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
    const {id: meetingId, name: meetingName, createdAt, endedAt, taskCount} = meeting
    const {name: teamName} = team
    const meetingDuration = relativeDate(createdAt, {
      now: endedAt,
      max: 2,
      suffix: false,
      smallDiff: 'less than a minute'
    })
    return (
      <TimelineEventCard
        iconName='history'
        timelineEvent={timelineEvent}
        title={
          <TimelineEventTitle>{`${meetingName} with ${teamName} Complete`}</TimelineEventTitle>
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

export default createFragmentContainer(TimelineEventCompletedRetroMeeting, {
  timelineEvent: graphql`
    fragment TimelineEventCompletedRetroMeeting_timelineEvent on TimelineEventCompletedRetroMeeting {
      ...TimelineEventCard_timelineEvent
      id
      meeting {
        id
        createdAt
        endedAt
        name
        taskCount
      }
      team {
        name
      }
    }
  `
})
