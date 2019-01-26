import {TimelineEventJoinedParabol_timelineEvent} from '__generated__/TimelineEventJoinedParabol_timelineEvent.graphql'
import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps} from 'react-router'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'
import StyledLink from 'universal/components/StyledLink'

interface Props extends RouteComponentProps<{}> {
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
          <StyledLink to='/me/settings'>User Settings</StyledLink>
          {'.'}
        </TimelineEventBody>
      </TimelineEventCard>
    )
  }
}

export default createFragmentContainer(
  TimelineEventJoinedParabol,
  graphql`
    fragment TimelineEventJoinedParabol_timelineEvent on TimelineEventJoinedParabol {
      id
    }
  `
)
