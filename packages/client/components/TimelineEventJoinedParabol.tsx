import {TimelineEventJoinedParabol_timelineEvent} from '../__generated__/TimelineEventJoinedParabol_timelineEvent.graphql'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import StyledLink from './StyledLink'
import TimelineEventBody from './TimelineEventBody'
import TimelineEventCard from './TimelineEventCard'
import TimelineEventTitle from './TImelineEventTitle'
import styled from '@emotion/styled'

interface Props {
  timelineEvent: TimelineEventJoinedParabol_timelineEvent
}

const Link = styled(StyledLink)({
  fontWeight: 600
})

class TimelineEventJoinedParabol extends Component<Props> {
  render() {
    const {timelineEvent} = this.props
    return (
      <TimelineEventCard
        iconName='account_circle'
        timelineEvent={timelineEvent}
        title={<TimelineEventTitle>You joined Parabol</TimelineEventTitle>}
      >
        <TimelineEventBody>
          {'Get started by updating your name and avatar in your '}
          <Link to='/me/profile'>user profile</Link>
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
