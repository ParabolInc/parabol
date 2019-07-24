import {TimelineEventJoinedParabol_timelineEvent} from '../__generated__/TimelineEventJoinedParabol_timelineEvent.graphql'
import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'

interface Props {
  timelineEvent: TimelineEventJoinedParabol_timelineEvent
}

class TimelineEventJoinedParabol extends Component<Props> {
  render () {
    const {timelineEvent} = this.props
    return (
      <TimelineEventCard
        iconName='account_circle'
        timelineEvent={timelineEvent}
        title={<TimelineEventTitle>You joined Parabol</TimelineEventTitle>}
      >
        <TimelineEventBody>
          {'Get started by updating your name and avatar in '}
          <StyledLink to='/me/profile'>User Profile</StyledLink>
          {'.'}
        </TimelineEventBody>
      </TimelineEventCard>
    )
  }
}

export default createFragmentContainer(TimelineEventJoinedParabol, {
  timelineEvent: graphql`
    fragment TimelineEventJoinedParabol_timelineEvent on TimelineEventJoinedParabol {
      ...TimelineEventCard_timelineEvent
      id
    }
  `
})
