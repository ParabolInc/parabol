import {TimelineEventCompletedActionMeeting_timelineEvent} from '__generated__/TimelineEventCompletedActionMeeting_timelineEvent.graphql'
import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps} from 'react-router'
import StyledLink from 'universal/components/StyledLink'
import relativeDate from '../utils/relativeDate'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props extends RouteComponentProps<{}> {
  timelineEvent: TimelineEventCompletedActionMeeting_timelineEvent
}

class TimelineEventCompletedActionMeeting extends Component<Props> {
  render () {
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
          <TimelineEventTitle
          >{`Action Meeting #${meetingNumber} for team ${teamName} complete!`}</TimelineEventTitle>
        }
      >
        <TimelineEventBody>
          {`It lasted ${meetingDuration} and generated ${taskCount} tasks.`}
          <br />
          {'See the '}
          <StyledLink to={`/summary/${meetingId}`}>Full Summary</StyledLink>
          {'.'}
        </TimelineEventBody>
      </TimelineEventCard>
    )
  }
}

export default createFragmentContainer(
  TimelineEventCompletedActionMeeting,
  graphql`
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
)
