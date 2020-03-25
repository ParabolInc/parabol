import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import plural from '../utils/plural'
import {TimelineEventCompletedRetroMeeting_timelineEvent} from '../__generated__/TimelineEventCompletedRetroMeeting_timelineEvent.graphql'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props {
  timelineEvent: TimelineEventCompletedRetroMeeting_timelineEvent
}

const CountItem = styled('span')({
  fontWeight: 600
})

const SubHeader = styled('span')({
  color: PALETTE.TEXT_GRAY
})

const Link = styled(StyledLink)({
  fontWeight: 600
})

class TimelineEventCompletedRetroMeeting extends Component<Props> {
  render() {
    const {timelineEvent} = this.props
    const {meeting, team} = timelineEvent
    const {
      id: meetingId,
      name: meetingName,
      commentCount,
      reflectionCount,
      topicCount,
      taskCount
    } = meeting
    const {name: teamName} = team
    return (
      <TimelineEventCard
        iconName='history'
        timelineEvent={timelineEvent}
        title={
          <TimelineEventTitle>{`${meetingName} with ${teamName} Complete`}</TimelineEventTitle>
        }
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
          <Link to={`/meet/${meetingId}/discuss/1`}>See the Discussion</Link>
          <SubHeader>{' in your meeting or '}</SubHeader>
          <Link to={`/new-summary/${meetingId}`}>review a summary</Link>
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
        commentCount
        name
        reflectionCount
        taskCount
        topicCount
      }
      team {
        name
      }
    }
  `
})
