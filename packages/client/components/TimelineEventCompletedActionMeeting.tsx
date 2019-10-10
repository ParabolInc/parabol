import {TimelineEventCompletedActionMeeting_timelineEvent} from '../__generated__/TimelineEventCompletedActionMeeting_timelineEvent.graphql'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps} from 'react-router'
import StyledLink from './StyledLink'
import plural from '../utils/plural'
import relativeDate from '../utils/date/relativeDate'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props extends RouteComponentProps<{}> {
  timelineEvent: TimelineEventCompletedActionMeeting_timelineEvent
}

class TimelineEventCompletedActionMeeting extends Component<Props> {
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
        iconName='change_history'
        timelineEvent={timelineEvent}
        title={
          <TimelineEventTitle>{`Action Meeting #${meetingNumber} with ${teamName} Complete`}</TimelineEventTitle>
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

export default createFragmentContainer(TimelineEventCompletedActionMeeting, {
  timelineEvent: graphql`
    fragment TimelineEventCompletedActionMeeting_timelineEvent on TimelineEventCompletedActionMeeting {
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
})
